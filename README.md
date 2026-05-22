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
