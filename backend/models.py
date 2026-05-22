from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class IncidentPayload(BaseModel):
    dynatrace_anomaly: str = Field(min_length=1)
    service_name: str = Field(min_length=1)
    pasted_logs: str | None = None
    gitlab_repo: str | None = None


class AnalysisResult(BaseModel):
    issue_category: str
    confidence_score: int = Field(ge=0, le=100)
    root_cause: str
    suspicious_commit: str
    beginner_explanation: str
    suggested_patch: str
    next_steps: list[str]


class IncidentRecord(BaseModel):
    id: str
    service_name: str
    severity: Literal["critical", "high", "medium"]
    status: Literal["open", "analyzing", "resolved"]
    created_at: str
    analysis: AnalysisResult | None = None
    dynatrace_anomaly: str | None = None
    logs: str | None = None
