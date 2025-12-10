# Cos_u — AI-Powered English Speaking Assessment & Voice Clone Feedback  
*AI-driven speaking evaluation system for TOEFL/IELTS learners*

Cos_u is an end-to-end **AI speaking assessment platform**, integrating real-time speech processing, machine-learning scoring models, and personalized **voice-clone sample generation** to help English learners understand their speaking performance and improve efficiently.

---

## 🚀 Features

### 🎤 Automated Speaking Scoring
- Whisper for transcription & embeddings  
- Acoustic feature extraction (pitch, tempo, energy, pauses)  
- ML regression models produce 4 subscores:  
  - Delivery  
  - Language Use  
  - Topic Development  
  - Overall Score  
- JSON-based scoring output

### 🗣️ Personalized Voice-Clone Sample
- Creates an “ideal version” of the user’s answer **in their own cloned voice**  
- Supports multiple proficiency levels (18/23/26/30)  
- Helps learners understand what a high-level spoken response sounds like

### ⚙️ Full API Layer (FastAPI / Node.js)
- `/score` — ML scoring  
- `/transcribe` — speech-to-text  
- `/sample` — voice clone enhanced response  
- `/agent` — feedback agent  
- Ready for frontend integration (CORS-enabled)

### 🖥️ Modern Frontend (React / Next.js)
- Clean UI for audio upload, scoring, visualization  
- Waveform visualization  
- Dashboard for subscores, transcript, and AI feedback  
- Responsive for web and mobile

---

## 🧠 Tech Stack

**ML / Speech**  
- Python, NumPy, librosa  
- Whisper  
- PCA + regression models  
- joblib model persistence  

**Backend**  
- FastAPI  
- Node.js + TypeScript  
- Audio preprocessing  
- Docker-ready  

**Frontend**  
- React / Next.js  
- Tailwind CSS  
- Custom audio components  

---

## 📂 Project Structure


