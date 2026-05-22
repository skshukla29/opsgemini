from __future__ import annotations

import json
from pathlib import Path
from typing import Any


class DynatraceService:
    def __init__(self) -> None:
        self._mock_path = Path(__file__).resolve().parents[1] / "frontend" / "data" / "mock_incidents.json"

    async def get_incidents(self) -> list[dict[str, Any]]:
        if not self._mock_path.exists():
            return []
        with self._mock_path.open("r", encoding="utf-8") as f:
            return json.load(f)
