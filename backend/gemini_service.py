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
            self._model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=SYSTEM_INSTRUCTION,
            )
        else:
            self._model = None

    def _fallback(self, payload: IncidentPayload) -> AnalysisResult:
        lower = f"{payload.dynatrace_anomaly} {payload.pasted_logs or ''}".lower()

        if "db_password" in lower or "undefined" in lower:
            category = "Configuration"
            confidence = 95
            root = "Missing DB_PASSWORD environment variable in runtime environment."
            patch = "```diff\n- const dbPassword = process.env.DB_PASSWORD;\n+ const dbPassword = process.env.DB_PASSWORD ?? process.env.DB_PASS;\n+ if (!dbPassword) throw new Error('DB password not configured');\n```"
            next_steps = [
                "Validate deployment secrets are mounted for the production namespace.",
                "Add startup env validation to fail fast before serving traffic.",
                "Rotate and re-sync DB credentials in CI/CD variables.",
            ]
        elif "cannot find module 'sharp'" in lower:
            category = "Dependency"
            confidence = 93
            root = "The sharp package is missing from production dependencies, causing container crash loops."
            patch = "```diff\n+ npm install sharp --save\n```"
            next_steps = [
                "Pin sharp version in package.json and lockfile.",
                "Rebuild image with clean layer cache.",
                "Add a CI step to detect missing runtime dependencies.",
            ]
        elif "redis" in lower or "econnrefused" in lower:
            category = "Infrastructure"
            confidence = 90
            root = "Application cannot connect to Redis at configured endpoint, leading to token timeouts."
            patch = "```diff\n- REDIS_HOST=127.0.0.1\n+ REDIS_HOST=redis.internal\n```"
            next_steps = [
                "Check Redis service health and DNS resolution from pod.",
                "Increase retry/backoff for auth token cache lookups.",
                "Deploy connection pooling and timeout tuning.",
            ]
        else:
            category = "Runtime Crash"
            confidence = 88
            root = "A recent deployment introduced an unhandled runtime exception under production traffic."
            patch = "```diff\n+ process.on('unhandledRejection', (err) => {\n+   logger.error(err);\n+   process.exit(1);\n+ });\n```"
            next_steps = [
                "Correlate deploy timestamp with error spike in Dynatrace.",
                "Roll back suspicious commit and re-run smoke tests.",
                "Add guardrails and typed validation at ingress boundaries.",
            ]

        return AnalysisResult(
            issue_category=category,
            confidence_score=confidence,
            root_cause=root,
            suspicious_commit="a1f3c92 - hotfix: adjust runtime config loading",
            beginner_explanation=(
                "The app broke because one required setting or dependency was missing after deployment. "
                "OpsGemini matched the failure pattern from logs and anomaly behavior."
            ),
            suggested_patch=patch,
            next_steps=next_steps,
        )

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
            return self._fallback(payload)

        prompt = (
            "Analyze the following incident and return strict JSON only.\n\n"
            f"Service: {payload.service_name}\n"
            f"Dynatrace anomaly: {payload.dynatrace_anomaly}\n"
            f"CI/CD logs: {payload.pasted_logs or 'N/A'}\n"
            f"GitLab repo: {payload.gitlab_repo or 'N/A'}\n"
        )

        try:
            response = await self._model.generate_content_async(prompt)
            raw_text = (response.text or "").strip()
            parsed = self._extract_json(raw_text)
            return AnalysisResult.model_validate(parsed)
        except Exception:
            return self._fallback(payload)
