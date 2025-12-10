📌 Cos_u — AI-Powered English Speaking Assessment & Voice Clone Feedback

(AI-driven speaking evaluation system for TOEFL/IELTS learners)

Cos_u is an end-to-end AI speaking assessment platform, integrating real-time speech processing, machine-learning scoring models, and personalized voice-clone sample generation to help English learners improve their speaking performance more effectively.

This project demonstrates capabilities across ML engineering, backend API design, frontend UI/UX, and speech technology.

🚀 Features
🎤 1. Automated Speaking Scoring

Uses Whisper for transcription & embeddings

Extracts acoustic features (pitch, tempo, energy, pauses, etc.)

ML regression models output 4 subscores:

Delivery

Language Use

Topic Development

Overall Score

Outputs structured JSON scoring results

🗣️ 2. Personalized Voice-Clone Sample

Generates an improved “ideal answer” in the student’s own cloned voice

Helps learners understand what a higher-level response sounds like

Supports multiple target score levels (18/23/26/30)

⚙️ 3. Full API Layer (FastAPI + Node/TS)

/score — returns full ML scoring

/transcribe — Whisper transcription

/sample — AI-enhanced voice feedback

/agent — follow-up feedback generation

CORS-enabled, ready for frontend integration

🖥️ 4. Modern Frontend (React/Next.js)

Clean UI for audio upload, scoring, visualization

Waveform visualization (real-time planned)

Dashboard for subscores, text transcripts, and AI feedback

Responsive design for web & mobile

🧠 Tech Stack
Machine Learning

Python, NumPy, librosa

Whisper (OpenAI)

PCA + custom regression models

Acoustic feature engineering

joblib model serialization

Backend

FastAPI (Python)

Node.js + TypeScript (secondary API layer)

Audio preprocessing pipeline

Docker-ready structure

Frontend

React / Next.js

Tailwind CSS

Custom waveform components

REST API integration

📂 Project Structure
Cos_u/
│
├── backend/
│   ├── scoring_service/      # ML pipeline, whisper, features, models
│   ├── api/                  # FastAPI endpoints
│   ├── utils/
│   └── requirements.txt
│
├── frontend/
│   ├── components/           # UI components
│   ├── pages/                # Next.js routes
│   └── public/
│
├── scoring_model/            # Saved ML models
├── voice_clone/              # TTS & sample generation
├── scripts/                  # Data processing tools
└── docs/                     # Diagrams, notes, dev logs

🧪 How to Run Locally
1. Clone repo
git clone https://github.com/Oliver1234567-come/Cos_u.git
cd Cos_u

2. Backend
cd backend
pip install -r requirements.txt
uvicorn app:app --reload

3. Frontend
cd frontend
npm install
npm run dev

4. Environment Variables

Create a .env file (not included in repo):

OPENAI_API_KEY=xxxx
ELEVENLABS_API_KEY=xxxx

🧭 Roadmap

 Add real-time waveform visualization

 Improve ML scoring accuracy with new dataset

 Deploy backend on Render / AWS

 Deploy frontend as PWA / mobile app

 Add user authentication & dashboard

 Expand multilingual support

📝 Author

Oliver (He Liang)
AI/ML Engineer · Full-Stack Builder · EdTech Innovator

Email: (optional)

Portfolio: (optional)

🎉 Contributions & Issues

Feel free to open issues or pull requests.
Suggestions for ML model improvements and architecture optimizations are welcome!
