// backend/api/src/controllers/scoreController.ts

import { Request, Response } from "express";

import { scoringApiClient } from "../services/scoringApiClient";
import { whisperClient } from "../services/whisperClient";
import { answerEnhancer } from "../services/answerEnhancer.service";
import { fuseScores } from "../services/scoreFusion";
import { mapFinalScoreToUI } from "../exam/outputMapping";
import { ExamType } from "../types/exam";

export const scoreController = {
  /* ======================================================
     ① 综合评分（声学 + 文本 + 融合）
     ====================================================== */
  async score(req: Request, res: Response) {
    try {
      const { audioBase64, examType, targetScore, timeLimitSec } = req.body;

      if (!audioBase64) {
        return res.status(400).json({ error: "audioBase64 is required" });
      }

      const exam = (examType?.toLowerCase() || "toefl") as ExamType;

      // ---------------------------
      // 1. Whisper → transcript
      // ---------------------------
      const transcript = await whisperClient(audioBase64);

      // ---------------------------
      // 2. 声学评分（Python 服务）
      // ---------------------------
      const acoustic = await scoringApiClient(audioBase64);

      // ---------------------------
      // 3. GPT 文本打分
      // ---------------------------
      const textScore = await answerEnhancer.analysis({
        transcript,
        examType: exam,
        taskType: exam,
        score: acoustic,
      });

      // ---------------------------
      // 4. 分数融合
      // ---------------------------
      const finalScore = fuseScores(acoustic, textScore, exam);

      // ---------------------------
      // 5. UI 映射（根据考试不同转化分数 0-30 / 0-9 / 160 / 90）
      // ---------------------------
      const examUiScore = mapFinalScoreToUI(finalScore, exam);

      // ---------------------------
      // 6. Get improvements
      // ---------------------------
      let improvements: string[] = [];
      try {
        const draftResult = await answerEnhancer.draft({
          transcript,
          score: finalScore,
          examType: exam,
          taskType: exam,
        });
        improvements = draftResult.tips?.map((tip: any) => 
          `${tip.title}: ${tip.detail}`
        ) || [];
      } catch (err) {
        console.warn("Failed to get improvements:", err);
      }

      return res.json({
        transcript,
        acoustic_score: acoustic,
        text_score: textScore,
        final_score: finalScore,
        exam_ui_score: examUiScore,
        improvements,
      });
    } catch (err: any) {
      console.error("🔥 SCORE ERROR:", err);
      return res.status(500).json({ error: err.message || "score failed" });
    }
  },

  /* ======================================================
     ② 文本分析（Improvement 提示）
     ====================================================== */
  async analyze(req: Request, res: Response) {
    try {
      const { transcript, score, examType, taskType } = req.body;

      const result = await answerEnhancer.analysis({
        transcript,
        score,
        examType,
        taskType,
      });

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  /* ======================================================
     ③ Draft（根据用户原稿 + 分数 → 改写答案）
     ====================================================== */
  async draft(req: Request, res: Response) {
    try {
      const { transcript, score, examType, taskType } = req.body;

      const result = await answerEnhancer.draft({
        transcript,
        score,
        examType,
        taskType,
      });

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  /* ======================================================
     ④ Sample（生成目标分数答案）
     ====================================================== */
  async sample(req: Request, res: Response) {
    try {
      const { transcript, targetScore, examType, taskType, timeLimitSec } =
        req.body;

      const result = await answerEnhancer.sample({
        transcript,
        targetScore,
        examType,
        taskType,
        timeLimitSec,
      });

      return res.json({ sample: result });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
};
