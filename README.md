# ⚡ OpsGemini
> AI-powered incident debugging agent for Google Cloud Rapid Agent Hackathon

## 🏆 Hackathon
- Event: Google Cloud Rapid Agent Hackathon
- Track: Dynatrace Partner Track
- Devpost: [link](https://devpost.com/)

## 🎯 What it does
OpsGemini Dynatrace anomaly detect karta hai, Gemini AI root cause dhundta hai, aur GitLab MR generate karta hai. Iska goal MTTR ko 120 min se 1.5 min tak reduce karna hai. Real-time incident context ke saath teams ko faster debugging aur cleaner remediation milti hai.

## 🏗️ Architecture
```text
Dynatrace MCP → FastAPI Backend → Gemini 1.5 Flash → Next.js Frontend
                      ↓
               Firebase Firestore
```

## 🛠️ Tech Stack
| Technology | Purpose | Version |
|---|---|---|
| Next.js 14 | Frontend | 14.2.3 |
| FastAPI | Backend | 0.111.0 |
| Gemini 1.5 Flash | AI Engine | latest |
| Dynatrace MCP | Observability | latest |
| Firebase Firestore | Database | latest |
| Google Cloud Run | Deployment | latest |

## ✨ Features
- Dynatrace anomaly ingestion via MCP
- Real Gemini AI root cause analysis
- Confidence scoring (0-100%)
- Beginner-friendly explanations
- Code patch generation with diff view
- GitLab MR creation
- MTTR trend tracking

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Gemini API key (aistudio.google.com)

### Backend
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add GEMINI_API_KEY in .env
uvicorn main:app --reload --port 8000
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

Open: `http://localhost:3006` or the Next.js port shown in your terminal.

## 🎬 Demo
[Add demo video link here]

Demo flow:
1. Landing page → Launch Dashboard
2. Select payment-api CRITICAL incident
3. Click "Analyze with Gemini"
4. View root cause, confidence score, patch
5. Create GitLab MR
6. Check History → MTTR 120min → 1.5min

## 📸 Screenshots
[Add screenshots here]

## 🔑 Environment Variables
```env
GEMINI_API_KEY=your_key # required
FIREBASE_PROJECT_ID=optional
DYNATRACE_API_TOKEN=optional
GITLAB_TOKEN=optional
```

## 📄 License
MIT License

## 👥 Built By
- [Shashikant Shukla - Full Stack developer]
