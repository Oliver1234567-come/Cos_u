// backend/api/src/exam/prompts.ts

import { ExamType } from "../types/exam";
import {
  genericTextRubric,
  getTaskRubric,
  getScoreBand,
  getScoreLevelRubric,
} from "./rubrics";
import { ScoreBreakdown } from "../types/score";

/* ===================== Type Definitions ===================== */

export interface AcousticScore {
  delivery: number;
  language_use: number;
  topic_dev: number;
  overall: number;
}

interface AnalysisInput {
  transcript: string;
  examType: ExamType;
  taskType: string;
  acousticScore: AcousticScore;
}

interface DraftInput {
  transcript: string;
  examType: ExamType;
  taskType: string;
  finalScore: ScoreBreakdown; // Final fused score
}

interface FinalizeInput {
  transcript: string;
  examType: ExamType;
  taskType: string;
  targetScore: number;        // User-selected target score (0–30)
  currentScore: ScoreBreakdown; // Current score (for prompting "from where to where")
}

export interface AnalysisPayload {
  transcript: string;
  score?: any;
  examType: ExamType;
  taskType: string;
}

export interface DraftPayload {
  transcript: string;
  score?: any;
  examType: ExamType;
  taskType: string;
}

export interface SamplePayload {
  transcript: string;
  targetScore: number;
  examType: ExamType;
  taskType: string;
  timeLimitSec: number;
}

/* ============================================================
   1) analysisPrompt: Let GPT give "text scores" + explanation
   ============================================================ */

export function analysisPrompt({
  transcript,
  examType,
  taskType,
  acousticScore,
}: AnalysisInput): string {
  const band = getScoreBand(acousticScore.overall);
  const task = getTaskRubric(examType, taskType);

  const taskText = task
    ? `${task.name}: ${task.requirement}`
    : `Unknown task type: ${taskType}`;

  const scoringMapping = `
Use TOEFL 0–30 as the unified backbone:

- For IELTS:
  - High TOEFL (26–30) ≈ Band 7.0–8.5
  - Mid TOEFL (20–25) ≈ Band 6.0–6.5
  - Low TOEFL (0–19) ≈ Band 3.0–5.5

- For Duolingo:
  - High TOEFL (26–30) ≈ 130–160
  - Mid TOEFL (20–25) ≈ 90–120
  - Low TOEFL (0–19) ≈ 10–85

- For PTE:
  - High TOEFL (26–30) ≈ 70–90
  - Mid TOEFL (20–25) ≈ 50–65
  - Low TOEFL (0–19) ≈ 10–45

You STILL output scores on a 0–30 scale: delivery, language_use, topic_dev, overall.
`;

  return `
You are a strict speaking examiner for ${examType.toUpperCase()}.

Your job now:
1. Read the student's transcript.
2. Consider the acoustic baseline (from an acoustic model trained on real student audio).
3. Consider the exam task requirement and band description.
4. Give four scores (0–30): delivery, language_use, topic_dev, overall.
5. Explain briefly why.

【Acoustic model baseline】
- delivery: ${acousticScore.delivery}
- language_use: ${acousticScore.language_use}
- topic_dev: ${acousticScore.topic_dev}
- overall: ${acousticScore.overall}

This baseline reflects:
- Delivery: fluency, pauses, hesitations, speed, repetition.
- Language_use: pronunciation clarity and basic grammatical stability detectable from audio.
- Topic_dev: information density and structural patterns.

CRITICAL: You MUST strictly follow the acoustic baseline:
- Your scores MUST stay within ±2 points of the acoustic baseline for each dimension.
- If acoustic delivery is 15, your delivery MUST be between 13-17, NOT 20+.
- If acoustic overall is 18, your overall MUST be between 16-20, NOT 25+.
- The acoustic model is trained on 200 real student recordings and is the PRIMARY source of truth.
- Your role is to provide MINOR adjustments based on transcript content, NOT to override the acoustic assessment.
- Different quality audio MUST result in different scores that reflect the acoustic differences.

【Current band】
- Band: ${band.label}
- Description: ${band.description}

【Exam & Task】
- Exam type: ${examType}
- Task: ${taskType}
- Task requirement: ${taskText}

【Text rubrics you should use】
- Delivery: ${genericTextRubric.delivery}
- Language use: ${genericTextRubric.language_use}
- Topic development: ${genericTextRubric.topic_dev}

IMPORTANT for Topic Development scoring:
- Prioritize FLUENCY and CONTENT VOLUME over strict argumentation logic
- Reward students who speak smoothly and provide substantial information
- Be lenient with structural organization - focus on whether they can express ideas continuously
- Lower the bar for logical coherence - the goal is to help students speak fluently with more content
- Only apply strict argumentation standards when acoustic baseline is very high (26+)

【Cross-exam interpretation】
${scoringMapping}

【Student transcript】
${transcript}

Now output ONLY a JSON object in this format:

{
  "delivery": number (0-30),
  "language_use": number (0-30),
  "topic_dev": number (0-30),
  "overall": number (0-30),
  "reasoning": {
    "delivery": "one or two sentences, refer to both acoustic baseline and text",
    "language_use": "one or two sentences about grammar/vocab",
    "topic_dev": "one or two sentences about structure/detail",
    "exam_specific": "how well this fits ${examType} and task ${taskType}"
  }
}
`;
}

/* ============================================================
   2) draftPrompt: AI Improvement Tips (3 items)
   ============================================================ */

export function draftPrompt({
  transcript,
  examType,
  taskType,
  finalScore,
}: DraftInput): string {
  const band = getScoreBand(finalScore.overall);
  const task = getTaskRubric(examType, taskType);

  const weakestDim =
    finalScore.delivery <= finalScore.language_use &&
    finalScore.delivery <= finalScore.topic_dev
      ? "delivery"
      : finalScore.language_use <= finalScore.topic_dev
      ? "language_use"
      : "topic_dev";

  return `
You are a speaking coach. A student just finished a ${examType.toUpperCase()} speaking ${taskType} task.

They got these final scores (0-30):
- delivery: ${finalScore.delivery}
- language_use: ${finalScore.language_use}
- topic_dev: ${finalScore.topic_dev}
- overall: ${finalScore.overall}

Current band: ${band.label} (${band.description})
Weakest dimension: ${weakestDim}

Exam & task:
- Exam type: ${examType}
- Task: ${taskType}
- ${
    task
      ? "Task requirement: " + task.requirement
      : "Task requirement: (no extra constraint provided)"
  }

Student transcript:
${transcript}

Now:
Give EXACTLY 3 concrete improvement tips, in JSON:

{
  "tips": [
    {
      "dimension": "delivery" | "language_use" | "topic_dev",
      "title": "short title of the problem",
      "detail": "Specifically explain where the problem is, use simple and easy-to-understand language",
      "next_practice": "Provide a very specific practice method for next time"
    },
    ...
  ]
}

Focus on:
- Clearly identify the student's biggest bug at their current stage
- Be specific about "how to practice"
- Each tip should focus on one thing only, avoid being vague
`;
}

/* ============================================================
   3) samplePrompt: Generate AI Sample for target score
   - Must: Base on student's original answer
   - Must: Only aim to reach targetScore, not perfect native level
   ============================================================ */

export function samplePrompt({
  transcript,
  examType,
  taskType,
  targetScore,
  currentScore,
}: FinalizeInput): string {
  const levelRubric = getScoreLevelRubric(examType, targetScore);
  const task = getTaskRubric(examType, taskType);

  const levelText = levelRubric
    ? `
Target score level (${targetScore}/30) description:
- Delivery: ${levelRubric.delivery}
- Language use: ${levelRubric.language_use}
- Topic development: ${levelRubric.topic_dev}
- Summary: ${levelRubric.summary}
`
    : `Target score: ${targetScore}/30 (use a reasonable level slightly above the current scores).`;

  return `
You are a speaking coach.

Goal:
Rewrite the student's answer so that it sounds like a typical ${examType.toUpperCase()} speaking response
with an overall level around **${targetScore}/30**.

IMPORTANT:
- Use the student's original answer as the FOUNDATION.
- Preserve the student's core IDEAS, opinions, and examples.
- DO NOT invent new stories, facts, or completely different reasons.
- You may reorder or slightly reframe ideas to make them clearer.
- Improve clarity, grammar, vocabulary, and structure so that it matches the target score level.
- Do NOT push it to a perfect/native 30/30 if targetScore is lower.

Current scores (0–30):
- delivery: ${currentScore.delivery}
- language_use: ${currentScore.language_use}
- topic_dev: ${currentScore.topic_dev}
- overall: ${currentScore.overall}

We want to move from the current level to approximately ${targetScore}/30.

Exam & task:
- Exam type: ${examType}
- Task: ${taskType}
- ${
    task
      ? "Task requirement: " + task.requirement
      : "Task requirement: (no extra constraint provided)"
  }

${levelText}

Student original answer:
${transcript}

Now output ONLY the improved answer text (one plain string), no explanation, no JSON, no comments.
The length and time should be roughly appropriate for the real exam time limit (do NOT write an essay).
`;
}

