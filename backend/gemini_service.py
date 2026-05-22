from __future__ import annotations

import json
import os
import re

import google.generativeai as genai

from models import AnalysisResult, IncidentPayload


SYSTEM_INSTRUCTION = (
    "You are OpsGemini, an expert Autonomous SRE Agent. Analyze Dynatrace observability "
    "anomalies correlated with GitLab deployment context. Return ONLY valid JSON with keys: "
    "issue_category, confidence_score (0-100), root_cause, suspicious_commit, "
    "beginner_explanation, suggested_patch (markdown code block), next_steps (array of strings). "
    "No extra text, no markdown fences around the JSON."
)


class GeminiService:
    def __init__(self) -> None:
        self._api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self._enabled = bool(self._api_key)

        if self._enabled:
            genai.configure(api_key=self._api_key)
            model_name = os.getenv("GEMINI_MODEL", "gemini-1.5")
            self._model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=SYSTEM_INSTRUCTION,
            )
        else:
            self._model = None

    def _extract_json(self, raw_text: str) -> dict:
        text = raw_text.strip()
        text = re.sub(r"^```json\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"^```\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                return json.loads(text[start : end + 1])
            raise

    async def analyze(self, payload: IncidentPayload) -> AnalysisResult:
        if not self._enabled or self._model is None:
            raise RuntimeError("GEMINI_API_KEY is not configured")

        anomaly = payload.dynatrace_anomaly.strip()
        logs = (payload.pasted_logs or "").strip()
        repo = (payload.gitlab_repo or "").strip() or "N/A"
        log_context = logs if logs else "No CI/CD logs were provided. Infer from the anomaly and repository context."

        prompt = (
            "You are OpsGemini, an incident triage agent. Analyze the current incident and return strict JSON only.\n"
            "Use the exact keys below and do not repeat canned text between runs. Ground every field in the supplied evidence.\n\n"
            "Return this JSON structure only:\n"
            "{\n"
            '  "issue_category": "",\n'
            '  "confidence_score": 0,\n'
            '  "root_cause": "",\n'
            '  "suspicious_commit": "",\n'
            '  "suspicious_commit_reason": "",\n'
            '  "beginner_explanation": "",\n'
            '  "suggested_patch": "",\n'
            '  "next_steps": []\n'
            "}\n\n"
            "Rules:\n"
            "- Return valid JSON only, no markdown fences, no prose outside the JSON.\n"
            "- Infer the most likely failure mode from anomaly + logs + repo context.\n"
            "- Confidence must change based on evidence strength.\n"
            "- Suggested patch must be specific to this incident, not generic.\n"
            "- Use different wording when the evidence changes.\n\n"
            f"Service: {payload.service_name}\n"
            f"Dynatrace anomaly: {anomaly}\n"
            f"CI/CD logs: {log_context}\n"
            f"GitLab repo: {repo}\n"
        )

        try:
            try:
                response = await self._model.generate_content_async(prompt)
            except Exception as exc:
                raise RuntimeError("Gemini API request failed; check GEMINI_API_KEY and model availability") from exc

            raw_text = (response.text or "").strip()
            if not raw_text:
                raise ValueError("Gemini returned an empty response")
            parsed = self._extract_json(raw_text)
            if not parsed.get("suspicious_commit") and parsed.get("suspicious_commit_reason"):
                parsed["suspicious_commit"] = parsed["suspicious_commit_reason"]
            return AnalysisResult.model_validate(parsed)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Gemini returned malformed JSON: {exc}") from exc
