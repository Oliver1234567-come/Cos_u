# scoring_api.py

import os
import joblib
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile

# 使用与app.py一致的特征提取方式（从bytes读取）
import librosa
import whisper
import torch
import numpy as np

# 加载Whisper模型（全局，只加载一次）
_whisper_model = None

def _get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = whisper.load_model("base")
    return _whisper_model

def extract_features_from_file(audio_path: str) -> np.ndarray:
    """
    从文件路径提取特征（与feature_extractor.py一致）
    """
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"音频文件不存在: {audio_path}")

    whisper_model = _get_whisper_model()
    
    # Whisper embedding
    audio = whisper.load_audio(audio_path)
    audio = whisper.pad_or_trim(audio)
    mel = whisper.log_mel_spectrogram(audio)
    mel = torch.tensor(mel, dtype=torch.float32, device=whisper_model.device)
    mel_batch = mel.unsqueeze(0)

    with torch.no_grad():
        enc = whisper_model.encoder(mel_batch)
        enc_mean = enc.mean(dim=1).cpu().numpy().flatten()

    # 声学特征（librosa）
    y, sr = librosa.load(audio_path, sr=16000)
    pitch, _ = librosa.piptrack(y=y, sr=sr)
    pitch_vals = pitch[pitch > 0]
    pitch_mean = float(np.mean(pitch_vals)) if len(pitch_vals) > 0 else 0.0
    pitch_std = float(np.std(pitch_vals)) if len(pitch_vals) > 0 else 0.0

    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    if isinstance(tempo, (list, np.ndarray)):
        tempo = float(tempo[0]) if len(tempo) > 0 else 0.0

    rms = librosa.feature.rms(y=y)
    energy = float(np.mean(rms)) if rms.size > 0 else 0.0

    acoustic_features = np.array([pitch_mean, pitch_std, tempo, energy], dtype=float)
    return np.concatenate([enc_mean, acoustic_features])

# ----------------------------------------
# 初始化 FastAPI
# ----------------------------------------
app = FastAPI(title="CosU Scoring API", version="1.0")

# 如要允许前端访问（可改）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------
# 加载模型
# ----------------------------------------
MODEL_DIR = "models_new"

print("正在加载模型...")

scaler = joblib.load(os.path.join(MODEL_DIR, "feature_scaler.joblib"))
pca = joblib.load(os.path.join(MODEL_DIR, "feature_pca.joblib"))

model_delivery = joblib.load(os.path.join(MODEL_DIR, "delivery.joblib"))
model_language = joblib.load(os.path.join(MODEL_DIR, "language_use.joblib"))
model_topic = joblib.load(os.path.join(MODEL_DIR, "topic_dev.joblib"))
model_overall = joblib.load(os.path.join(MODEL_DIR, "overall.joblib"))

print("模型加载完成！")


# ---------------------------------------------------------
# ★ API: 上传音频并获得评分
# ---------------------------------------------------------
@app.post("/score")
async def score_audio(file: UploadFile = File(...), task_type: int = 1):
    """
    上传音频文件，返回 4 个评分
    task_type: 1=独立口语, 2/3/4=综合口语 (默认 1)
    """

    # 1. 检查格式
    if not file.filename.lower().endswith((".mp3", ".m4a", ".wav", ".aac")):
        raise HTTPException(status_code=400, detail="只支持音频文件：mp3 / m4a / wav / aac")

    # 2. 先保存到临时文件
    with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
        tmp.write(await file.read())
        temp_path = tmp.name

    try:
        # 3. 提取特征（使用与训练时一致的方式）
        feat = extract_features_from_file(temp_path)  # numpy 向量 (516维: Whisper 512 + 声学特征 4)

        # 4. 检查模型期望的维度
        # 如果scaler期望517维，说明训练时包含了task_type，需要添加
        # 如果scaler期望516维，说明训练时没有task_type，不需要添加
        if scaler.n_features_in_ == 517:
            # 训练时包含了task_type，需要添加
            task_arr = np.array([task_type], dtype=float)
            X = np.concatenate([feat, task_arr]).reshape(1, -1)  # (1, 517)
        elif scaler.n_features_in_ == 516:
            # 训练时没有task_type，直接使用516维
            X = feat.reshape(1, -1)  # (1, 516)
        else:
            raise ValueError(f"模型期望 {scaler.n_features_in_} 维特征，但提取的特征是 {feat.shape[0]} 维，维度不匹配！")

        # 5. 标准化 & PCA
        feat_scaled = scaler.transform(X)
        feat_pca = pca.transform(feat_scaled)

        # 5. 模型预测
        pred_delivery = float(model_delivery.predict(feat_pca)[0])
        pred_language = float(model_language.predict(feat_pca)[0])
        pred_topic = float(model_topic.predict(feat_pca)[0])
        pred_overall = float(model_overall.predict(feat_pca)[0])

        return {
            "delivery": round(pred_delivery, 2),
            "language_use": round(pred_language, 2),
            "topic_dev": round(pred_topic, 2),
            "overall": round(pred_overall, 2),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"评分失败: {str(e)}")

    finally:
        # 删除临时文件
        try:
            os.remove(temp_path)
        except:
            pass


# ---------------------------------------------------------
# 测试用主页
# ---------------------------------------------------------
@app.get("/")
def root():
    return {"message": "CosU Scoring API is running!"}

