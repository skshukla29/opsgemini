from __future__ import annotations

import os
from typing import Any

import firebase_admin
from firebase_admin import credentials, firestore

from models import AnalysisResult


class FirebaseService:
    def __init__(self) -> None:
        self._project_id = os.getenv("FIREBASE_PROJECT_ID", "").strip()
        self._enabled = False
        self._db = None
        self._memory_store: dict[str, Any] = {}

        if not self._project_id:
            return

        try:
            if not firebase_admin._apps:
                firebase_admin.initialize_app(
                    credentials.ApplicationDefault(),
                    {"projectId": self._project_id},
                )
            self._db = firestore.client()
            self._enabled = True
        except Exception:
            self._enabled = False

    async def save_analysis(self, incident_id: str, analysis: AnalysisResult) -> None:
        if self._enabled and self._db is not None:
            self._db.collection("incidents").document(incident_id).set(
                {"analysis": analysis.model_dump(), "status": "analyzing"},
                merge=True,
            )
            return

        self._memory_store.setdefault(incident_id, {})["analysis"] = analysis.model_dump()
        self._memory_store[incident_id]["status"] = "analyzing"

    async def resolve_incident(self, incident_id: str) -> None:
        if self._enabled and self._db is not None:
            self._db.collection("incidents").document(incident_id).set(
                {"status": "resolved"},
                merge=True,
            )
            return

        self._memory_store.setdefault(incident_id, {})["status"] = "resolved"

    async def get_overlay(self, incident_id: str) -> dict[str, Any]:
        if self._enabled and self._db is not None:
            snap = self._db.collection("incidents").document(incident_id).get()
            return snap.to_dict() or {}

        return self._memory_store.get(incident_id, {})
