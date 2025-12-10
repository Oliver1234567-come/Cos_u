// backend/api/src/routes/voice.routes.ts
import { Router } from "express";
import multer from "multer";
import { cloneVoice, generateSpeech } from "../controllers/voiceController";

const upload = multer(); // 内存存储（buffer）
const router = Router();

// 用户第一次录音 → 克隆声音 → 返回 voiceId
router.post("/clone", upload.single("audio"), cloneVoice);

// 根据 voiceId + text 来生成 Sample 音频
router.post("/tts", generateSpeech);

export default router;
