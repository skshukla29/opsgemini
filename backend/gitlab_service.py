from __future__ import annotations

import os

import httpx


class GitLabService:
    def __init__(self) -> None:
        self._token = os.getenv("GITLAB_TOKEN", "").strip()

    async def get_recent_commit_hint(self, repo_url: str | None) -> str:
        if not repo_url:
            return "No repository URL provided."

        if not self._token:
            return "GitLab token missing; using heuristic commit correlation."

        # Stub for hackathon demo; this keeps the integration contract in place.
        async with httpx.AsyncClient(timeout=10.0) as client:
            _ = client
            return "b72ad10 - chore: update deployment env vars"
