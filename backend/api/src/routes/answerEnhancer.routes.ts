// src/routes/answerEnhancer.routes.ts

import { Router } from "express";
import { getAnalysis, getTips, getSample } from "../controllers/answerEnhancer.controller";

const router = Router();

// 分析当前表现（给 overall_reason）
router.post("/analysis", getAnalysis);

// AI Improvement Tip（3条可执行建议）
router.post("/tips", getTips);

// 生成基于目标分数的更优版本 Sample Answer
router.post("/sample", getSample);

export default router;
