# backend/scoring_service/app.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import uvicorn
import numpy as np
import librosa
import whisper
import torch
import joblib
import os
import tempfile

MODEL_DIR = "models_new"

# === 加载模型 ===
scaler = joblib.load(os.path.join(MODEL_DIR, "feature_scaler.joblib"))
pca = joblib.load(os.path.join(MODEL_DIR, "feature_pca.joblib"))
model_del = joblib.load(os.path.join(MODEL_DIR, "delivery.joblib"))
model_lang = joblib.load(os.path.join(MODEL_DIR, "language_use.joblib"))
model_topic = joblib.load(os.path.join(MODEL_DIR, "topic_dev.joblib"))
model_overall = joblib.load(os.path.join(MODEL_DIR, "overall.joblib"))

# Whisper
whisper_model = whisper.load_model("base")


# === 读取音频（从 bytes 转文件）===
def load_audio_from_bytes(data: bytes):
    import soundfile as sf
    import io

    try:
        y, sr = sf.read(io.BytesIO(data))
    except:
        # 回退到 librosa
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".tmp")
        tmp.write(data)
        tmp.close()
        y, sr = librosa.load(tmp.name, sr=16000)
        os.unlink(tmp.name)

    if y.ndim > 1:
        y = y.mean(axis=1)

    if sr != 16000:
        y = librosa.resample(y, orig_sr=sr, target_sr=16000)
        sr = 16000

    return y, sr


# === 特征提取 ===
def extract_features(data: bytes) -> np.ndarray:
    y, sr = load_audio_from_bytes(data)

    # Whisper embedding
    audio = whisper.pad_or_trim(y)
    mel = whisper.log_mel_spectrogram(audio)
    mel = torch.tensor(mel, dtype=torch.float32, device=whisper_model.device)
    mel_batch = mel.unsqueeze(0)

    with torch.no_grad():
        enc = whisper_model.encoder(mel_batch)
        enc_mean = enc.mean(dim=1).cpu().numpy().flatten()

    # 声学特征
    pitch, _ = librosa.piptrack(y=y, sr=sr)
    pitch_vals = pitch[pitch > 0]
    pitch_mean = float(pitch_vals.mean()) if pitch_vals.size > 0 else 0.0
    pitch_std = float(pitch_vals.std()) if pitch_vals.size > 0 else 0.0

    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    tempo = float(tempo if not isinstance(tempo, (list, np.ndarray)) else tempo[0])

    rms = librosa.feature.rms(y=y)
    energy = float(np.mean(rms))

    acoustic = np.array([pitch_mean, pitch_std, tempo, energy])

    return np.concatenate([enc_mean, acoustic])


# === FastAPI ===
app = FastAPI()


@app.post("/score")
async def score_audio(
    audio: UploadFile = File(...),
    task_type: int = Form(1)  # ⭐ 默认 task_type = 1
):
    """
    task_type 默认 1（独立口语）
    前端不传也能跑；未来可选择 1/2/3/4
    """
    try:
        raw = await audio.read()

        features = extract_features(raw)

        # ⭐ 把 task_type 加入最后一维，保证特征维度一致（517）
        task_arr = np.array([task_type], dtype=float)
        X = np.concatenate([features, task_arr]).reshape(1, -1)

        # 预处理 + PCA
        X_scaled = scaler.transform(X)
        X_pca = pca.transform(X_scaled)

        # 预测
        delivery = float(model_del.predict(X_pca)[0])
        language_use = float(model_lang.predict(X_pca)[0])
        topic_dev = float(model_topic.predict(X_pca)[0])
        overall = float(model_overall.predict(X_pca)[0])

        return {
            "task_type": task_type,
            "delivery": delivery,
            "language_use": language_use,
            "topic_dev": topic_dev,
            "overall": overall,
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
