from __future__ import annotations

from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from dynatrace_service import DynatraceService
from firebase_service import FirebaseService
from gemini_service import GeminiService
from models import AnalysisResult, IncidentPayload, IncidentRecord

load_dotenv(Path(__file__).with_name(".env"))

app = FastAPI(title="OpsGemini API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


dynatrace_service = DynatraceService()
firebase_service = FirebaseService()
gemini_service = GeminiService()


async def _load_incident_map() -> dict[str, IncidentRecord]:
    records = await dynatrace_service.get_incidents()
    result: dict[str, IncidentRecord] = {}

    for raw in records:
        service_name = raw.get("service") or raw.get("service_name")
        record = IncidentRecord(
            id=raw["id"],
            service_name=service_name,
            severity=raw["severity"],
            status=raw.get("status", "open"),
            created_at=raw["created_at"],
            dynatrace_anomaly=raw.get("anomaly") or raw.get("dynatrace_anomaly"),
            logs=raw.get("logs"),
        )

        overlay = await firebase_service.get_overlay(record.id)
        if overlay.get("analysis"):
            record.analysis = AnalysisResult.model_validate(overlay["analysis"])
        if overlay.get("status") in {"open", "analyzing", "resolved"}:
            record.status = overlay["status"]

        result[record.id] = record

    return result


@app.get("/api/incidents", response_model=list[IncidentRecord])
async def get_incidents() -> list[IncidentRecord]:
    incident_map = await _load_incident_map()
    items = sorted(
        incident_map.values(),
        key=lambda item: item.created_at,
        reverse=True,
    )
    return items


@app.get("/api/incidents/{incident_id}", response_model=IncidentRecord)
async def get_incident(incident_id: str) -> IncidentRecord:
    incident_map = await _load_incident_map()
    incident = incident_map.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@app.post("/api/analyze-incident", response_model=AnalysisResult)
async def analyze_incident(payload: IncidentPayload) -> AnalysisResult:
    try:
        analysis = await gemini_service.analyze(payload)
        incident_map = await _load_incident_map()
        matching = next(
            (item for item in incident_map.values() if item.service_name == payload.service_name),
            None,
        )
        persist_id = matching.id if matching else f"{payload.service_name}-latest"
        await firebase_service.save_analysis(persist_id, analysis)
        return analysis
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to analyze incident: {exc}") from exc


@app.post("/api/incidents/{incident_id}/resolve")
async def resolve_incident(incident_id: str) -> dict[str, str]:
    incident_map = await _load_incident_map()
    if incident_id not in incident_map:
        raise HTTPException(status_code=404, detail="Incident not found")

    await firebase_service.resolve_incident(incident_id)
    return {"status": "resolved"}


@app.get("/api/stats")
async def get_stats() -> dict[str, Any]:
    incident_map = await _load_incident_map()
    items = list(incident_map.values())
    resolved_count = sum(1 for item in items if item.status == "resolved")

    return {
        "avg_mttr_before": 120,
        "avg_mttr_after": 1.5,
        "total_incidents": len(items),
        "resolved_count": resolved_count,
    }
