// src/controllers/answerEnhancer.controller.ts

import { Request, Response } from "express";
import { answerEnhancer } from "../services/answerEnhancer.service";

/**
 * POST /api/answer_enhancer/analysis
 * body: { transcript, score, taskType, examType? }
 */
export const getAnalysis = async (req: Request, res: Response) => {
  try {
    const { transcript, score, taskType, examType } = req.body;
    const result = await answerEnhancer.analysis({
      transcript,
      score,
      taskType,
      examType: examType || "toefl",
    });
    res.json(result);
  } catch (err) {
    console.error("getAnalysis error:", err);
    res.status(500).json({ error: "Failed to analyze answer" });
  }
};

/**
 * POST /api/answer_enhancer/tips
 * body: { transcript, score, taskType, examType? }
 */
export const getTips = async (req: Request, res: Response) => {
  try {
    const { transcript, score, taskType, examType } = req.body;
    const result = await answerEnhancer.draft({
      transcript,
      score,
      taskType,
      examType: examType || "toefl",
    });
    res.json(result);
  } catch (err) {
    console.error("getTips error:", err);
    res.status(500).json({ error: "Failed to generate improvement tips" });
  }
};

/**
 * POST /api/answer_enhancer/sample
 * body: { transcript, targetScore, taskType, timeLimitSec, examType? }
 */
export const getSample = async (req: Request, res: Response) => {
  try {
    const { transcript, targetScore, taskType, timeLimitSec, examType } = req.body;
    const result = await answerEnhancer.sample({
      transcript,
      targetScore,
      taskType,
      timeLimitSec,
      examType: examType || "toefl",
    });
    res.json({ sample: result });
  } catch (err) {
    console.error("getSample error:", err);
    res.status(500).json({ error: "Failed to generate AI sample answer" });
  }
};
