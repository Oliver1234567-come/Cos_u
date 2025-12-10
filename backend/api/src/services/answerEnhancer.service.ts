// backend/api/src/services/answerEnhancer.service.ts

import {
  analysisPrompt,
  draftPrompt,
  samplePrompt,
  type AnalysisPayload,
  type DraftPayload,
  type SamplePayload,
} from "../exam/prompts";

import { callLLM } from "./llmClient";
import { normalizeExamAndTask } from "../exam/rubrics";
import { ScoreBreakdown } from "../types/score";
import { ExamType } from "../types/exam";

// -----------------------------
// ① 分析用户回答（评分+建议）
// -----------------------------
export async function analyzeAnswer({
  transcript,
  score,
  examType,
  taskType,
}: {
  transcript: string;
  score?: any;
  examType: string;
  taskType: string;
}): Promise<ScoreBreakdown> {
  const { exam, task } = normalizeExamAndTask(examType, taskType);

  // If score is provided, use it as acousticScore, otherwise use default
  const acousticScore = score || {
    delivery: 0,
    language_use: 0,
    topic_dev: 0,
    overall: 0,
  };

  const prompt = analysisPrompt({
    transcript,
    examType: exam,
    taskType: task,
    acousticScore,
  });

  const resp = await callLLM(prompt);
  
  // Clean up response - remove markdown code blocks if present
  let cleanedResp = resp.trim();
  if (cleanedResp.startsWith("```json")) {
    cleanedResp = cleanedResp.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (cleanedResp.startsWith("```")) {
    cleanedResp = cleanedResp.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }
  
  const parsed = JSON.parse(cleanedResp);
  
  return {
    delivery: parsed.delivery || 0,
    language_use: parsed.language_use || 0,
    topic_dev: parsed.topic_dev || 0,
    overall: parsed.overall || 0,
  };
}

// -----------------------------
// ② 生成 revised draft（基于用户答案）
// -----------------------------
export async function generateDraft({
  transcript,
  score,
  examType,
  taskType,
}: {
  transcript: string;
  score?: any;
  examType: string;
  taskType: string;
}): Promise<{ tips: Array<{ dimension: string; title: string; detail: string; next_practice: string }> }> {
  const { exam, task } = normalizeExamAndTask(examType, taskType);

  // If score is provided, use it as finalScore
  const finalScore: ScoreBreakdown = score || {
    delivery: 0,
    language_use: 0,
    topic_dev: 0,
    overall: 0,
  };

  const prompt = draftPrompt({
    transcript,
    examType: exam,
    taskType: task,
    finalScore,
  });

  const resp = await callLLM(prompt);
  
  // Clean up response - remove markdown code blocks if present
  let cleanedResp = resp.trim();
  if (cleanedResp.startsWith("```json")) {
    cleanedResp = cleanedResp.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (cleanedResp.startsWith("```")) {
    cleanedResp = cleanedResp.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }
  
  return JSON.parse(cleanedResp);
}

// -----------------------------
// ③ 生成目标分数 sample（升级版 AI 答案）
// -----------------------------
export async function generateSample({
  transcript,
  targetScore,
  examType,
  taskType,
  timeLimitSec,
}: {
  transcript: string;
  targetScore: number;
  examType: string;
  taskType: string;
  timeLimitSec: number;
}): Promise<string> {
  const { exam, task } = normalizeExamAndTask(examType, taskType);

  // Use a default currentScore if not provided
  const currentScore: ScoreBreakdown = {
    delivery: 0,
    language_use: 0,
    topic_dev: 0,
    overall: 0,
  };

  const prompt = samplePrompt({
    transcript,
    examType: exam,
    taskType: task,
    targetScore,
    currentScore,
  });

  const resp = await callLLM(prompt);
  return resp.trim();
}

// Export as a service object matching the controller's expected interface
export const answerEnhancer = {
  async analysis({
    transcript,
    score,
    examType,
    taskType,
  }: {
    transcript: string;
    score?: any;
    examType: string;
    taskType: string;
  }): Promise<ScoreBreakdown> {
    return analyzeAnswer({ transcript, score, examType, taskType });
  },

  async draft({
    transcript,
    score,
    examType,
    taskType,
  }: {
    transcript: string;
    score?: any;
    examType: string;
    taskType: string;
  }): Promise<{ tips: Array<{ dimension: string; title: string; detail: string; next_practice: string }> }> {
    return generateDraft({ transcript, score, examType, taskType });
  },

  async sample({
    transcript,
    targetScore,
    examType,
    taskType,
    timeLimitSec,
  }: {
    transcript: string;
    targetScore: number;
    examType: string;
    taskType: string;
    timeLimitSec: number;
  }): Promise<string> {
    return generateSample({ transcript, targetScore, examType, taskType, timeLimitSec });
  },
};
