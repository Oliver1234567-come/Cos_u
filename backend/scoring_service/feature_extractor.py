# feature_extractor.py

import os
import numpy as np
import librosa
import whisper
import torch

# Whisper 模型只加载一次，提高性能
_whisper_model = whisper.load_model("base")


def extract_features(audio_path: str) -> np.ndarray:
    """
    提取音频特征：
    1. Whisper encoder 均值 embedding
    2. 声学特征（pitch、pitch_std、tempo、energy）
    """

    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"音频文件不存在: {audio_path}")

    # ----------------------------------------
    # Whisper 部分
    # ----------------------------------------
    audio = whisper.load_audio(audio_path)
    audio = whisper.pad_or_trim(audio)

    mel = whisper.log_mel_spectrogram(audio)
    mel = torch.tensor(mel, dtype=torch.float32, device=_whisper_model.device)

    mel_batch = mel.unsqueeze(0)  # (1, 80, T)

    with torch.no_grad():
        enc = _whisper_model.encoder(mel_batch)  # (1, T', 512)
        enc_mean = enc.mean(dim=1).cpu().numpy().flatten()

    # ----------------------------------------
    # 声学特征部分（librosa）
    # ----------------------------------------
    y, sr = librosa.load(audio_path, sr=16000)

    # Pitch
    pitch, _ = librosa.piptrack(y=y, sr=sr)
    pitch_vals = pitch[pitch > 0]
    pitch_mean = float(np.mean(pitch_vals)) if len(pitch_vals) > 0 else 0.0
    pitch_std = float(np.std(pitch_vals)) if len(pitch_vals) > 0 else 0.0

    # Tempo
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    if isinstance(tempo, (list, np.ndarray)):
        tempo = float(tempo[0]) if len(tempo) > 0 else 0.0

    # Energy
    rms = librosa.feature.rms(y=y)
    energy = float(np.mean(rms)) if rms.size > 0 else 0.0

    acoustic_features = np.array([
        pitch_mean,
        pitch_std,
        tempo,
        energy
    ], dtype=float)

    # ----------------------------------------
    # 合并特征
    # ----------------------------------------
    return np.concatenate([enc_mean, acoustic_features])
