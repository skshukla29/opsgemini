# OpsGemini (Local README)

Short demo project that analyzes incident logs using a FastAPI backend and a Next.js frontend. The backend calls Gemini (via your local `GEMINI_API_KEY`) to produce structured JSON analyses that the UI renders.

## Quick overview
- Backend: FastAPI (uvicorn) — serves API endpoints under `/api/*`.
- Frontend: Next.js app — dashboard UI that posts to `/api/analyze-incident`.

## Important files
- [backend/.env](backend/.env) — local environment file (UNTRACKED). Add your `GEMINI_API_KEY` and optional `GEMINI_MODEL` here.
- [frontend/lib/api.ts](frontend/lib/api.ts) — client code that points the frontend to the backend API base URL.
- [frontend/app/dashboard/[id]/page.tsx](frontend/app/dashboard/[id]/page.tsx) — analysis UI.

## Ports used (local demo)
- Backend (uvicorn): `http://127.0.0.1:8000` (API endpoints)
- Frontend (Next dev): `http://localhost:3006` (may fall back to other ports if 3000-3005 are in use)

## Setup & run (Windows / PowerShell)

1. Backend venv & dependencies

```powershell
cd backend
# If you use the repo-root .venv, adjust paths accordingly (e.g., ..\.venv\Scripts\python.exe)
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Add a local `.env` for sensitive keys (do NOT commit)

Create `backend/.env` with at least:

```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE   # add your local key (do NOT commit)
# Optional: GEMINI_MODEL=models/gemini-flash-latest
```

3. Start the backend (from `backend` folder)

```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

4. Start the frontend (from `frontend` folder)

```powershell
cd frontend
npm install
npm run dev
# Next will try 3000 and increment if occupied; current demo used 3006.
```

5. Open the dashboard in your browser

Visit `http://localhost:3006/dashboard/dt-9921` (replace port if Next chose a different one). Click **Analyze with Gemini** to run a live analysis.

## Notes & troubleshooting
- Ensure `backend/.env` is present and contains a valid `GEMINI_API_KEY` before starting the backend. The app loads `backend/.env` at startup.
- If you prefer fixed frontend port 3000, stop the process occupying it and restart Next; Next will otherwise choose the next available port.
- The frontend uses `NEXT_PUBLIC_API_URL` if set; otherwise it defaults to `http://localhost:8000` (see [frontend/lib/api.ts](frontend/lib/api.ts)).

## Project status
- The demo performs live Gemini analysis (no static/mock responses). The UI intentionally uses small `MOCK_INCIDENTS` only for initial telemetry fields (service name, example logs). Analysis results are fetched from the backend at runtime.

---
Created for local demo and verification. If you want, I can add a short `dev-setup.md` with screenshots or adjust ports to fixed values.
# OpsGemini

OpsGemini is an AI-powered CI/CD incident debugging agent that bridges Dynatrace production anomalies with GitLab code context. It helps teams reduce MTTR by generating root-cause analysis, confidence scoring, suspicious commit hints, and suggested patches using Gemini.

## Architecture

```text
Dynatrace Anomaly/Webhook
          |
          v
  FastAPI Backend (OpsGemini API)
   - Incident ingestion
   - Gemini analysis orchestration
   - GitLab correlation service
   - Firebase history persistence
          |
          v
 Gemini 1.5 Flash (google-generativeai)
          |
          v
Next.js 14 Frontend Dashboard
 - Active incidents
 - AI analysis workspace
 - MTTR trend history
```

## Setup

1. Clone repository

```bash
git clone <your-repo-url>
cd opsgemini
```

2. Configure environment

```bash
cp backend/.env.example backend/.env
# Fill in GEMINI_API_KEY and optional Firebase/GitLab/Dynatrace values
```

3. Start with Docker Compose

```bash
docker-compose up --build
```

4. Open applications
- Frontend: http://localhost:3000
- Backend docs: http://localhost:8000/docs

## Demo Flow

1. Open Dashboard and select any active incident from the sidebar.
2. Enter optional CI/CD logs and GitLab repo URL.
3. Click Analyze with Gemini.
4. Review issue category, confidence score, root cause, next steps, and patch.
5. Click Create GitLab MR to simulate remediation and mark incident resolved.
6. Open History to view MTTR trend impact and resolved incident table.

## Mock Incidents Included

- dt-9921 payment-api DB credential crash
- dt-9922 frontend-web undefined map exception
- dt-9923 auth-service Redis timeout regression
- dt-9924 notification-worker memory/OOM incident
- dt-9925 image-processor missing sharp dependency

## Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts |
| Backend | FastAPI, Python 3.11, Pydantic v2 |
| AI | Google Gemini 1.5 Flash (`google-generativeai`) |
| Persistence | Firebase Firestore (with in-memory fallback) |
| Dev Infra | Docker Compose |
| Deployment Target | Google Cloud Run |

## Hackathon Track

- Dynatrace + Google Cloud

## Screenshots

- `landing-page.png` (placeholder)
- `dashboard.png` (placeholder)
- `analysis-screen.png` (placeholder)
- `history-mttr.png` (placeholder)

## Notes

- If Gemini API is unavailable, backend uses deterministic fallback analysis so demos remain reliable.
- Firebase is optional for local demo; when unavailable, incident overlay state is maintained in memory.

## Version Control

If `git commit` says there is nothing to commit, make a small tracked change first, then run:

```bash
git add -A
git commit -m "Update OpsGemini docs"
git push origin main
```
