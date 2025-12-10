// backend/api/src/exam/outputMapping.ts

import { ExamType } from "../types/exam";
import { ScoreBreakdown } from "../types/score";

/* ============================================================
   1) Score ranges for different exams
   ============================================================ */

export const examRanges = {
  toefl: { min: 0, max: 30 },
  ielts: { min: 0, max: 9 },
  pte: { min: 10, max: 90 },
  duolingo: { min: 10, max: 160 },
};

/* ============================================================
   2) TOEFL → Other exam mappings (simple linear proportion)
   ============================================================ */

export function toIELTS(toefl: number): number {
  return parseFloat(((toefl / 30) * 9).toFixed(1));
}

export function toPTE(toefl: number): number {
  return Math.round((toefl / 30) * 90);
}

export function toDuolingo(toefl: number): number {
  return Math.round((toefl / 30) * 160);
}

/* ============================================================
   3) Map TOEFL sub-dimensions to target exam
   ============================================================ */

export function mapDimensionScore(
  toeflScore: number,
  examType: ExamType
): number {
  switch (examType) {
    case "toefl":
      return toeflScore;

    case "ielts":
      return toIELTS(toeflScore); // 0–9
    case "pte":
      return toPTE(toeflScore); // 10–90
    case "duolingo":
      return toDuolingo(toeflScore); // 10–160

    default:
      return toeflScore;
  }
}

/* ============================================================
   4) Final UI display structure
   ============================================================ */

export function mapFinalScoreToUI(
  finalScore: ScoreBreakdown,
  examType: ExamType
): {
  examType: ExamType;
  overall: number;
  delivery: number;
  language_use: number;
  topic_dev: number;
} {
  const { overall, delivery, language_use, topic_dev } = finalScore;

  // Map scores
  const mappedOverall = mapDimensionScore(overall, examType);
  const mappedDelivery = mapDimensionScore(delivery, examType);
  const mappedLanguage = mapDimensionScore(language_use, examType);
  const mappedTopicDev = mapDimensionScore(topic_dev, examType);

  return {
    examType,
    overall: mappedOverall,
    delivery: mappedDelivery,
    language_use: mappedLanguage,
    topic_dev: mappedTopicDev,
  };
}

