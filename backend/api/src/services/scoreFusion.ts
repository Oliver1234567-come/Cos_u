// backend/api/src/services/scoreFusion.ts

import { ScoreBand, getScoreBand } from "../exam/rubrics";
import { ScoreBreakdown } from "../types/score";
import { ExamType } from "../types/exam";

export interface RawScore {
  delivery: number;
  language_use: number;
  topic_dev: number;
  overall: number;
}

export interface FusionMeta {
  weights: {
    acoustic: number;
    text: number;
  };
  band: ScoreBand;
  normalized: {
    acoustic: RawScore;
    text: RawScore;
  };
}

export type FusedScore = ScoreBreakdown & {
  meta?: FusionMeta;
};

function clampTo30(x: number): number {
  if (Number.isNaN(x)) return 0;
  if (x < 0) return 0;
  if (x > 30) return 30;
  return x;
}

function mapAcousticTo30(x: number): number {
  return clampTo30(x);
}

function getDynamicWeights(acousticOverall: number): { acoustic: number; text: number } {
  const s = clampTo30(acousticOverall);

  if (s <= 17) {
    return { acoustic: 0.7, text: 0.3 };
  } else if (s <= 22) {
    return { acoustic: 0.6, text: 0.4 };
  } else {
    return { acoustic: 0.5, text: 0.5 };
  }
}

export function fuseScores(
  acoustic: RawScore,
  text: RawScore,
  examType?: ExamType
): FusedScore {
  const acousticNorm: RawScore = {
    delivery: mapAcousticTo30(acoustic.delivery),
    language_use: mapAcousticTo30(acoustic.language_use),
    topic_dev: mapAcousticTo30(acoustic.topic_dev),
    overall: mapAcousticTo30(acoustic.overall),
  };

  const textNorm: RawScore = {
    delivery: clampTo30(text.delivery),
    language_use: clampTo30(text.language_use),
    topic_dev: clampTo30(text.topic_dev),
    overall: clampTo30(text.overall),
  };

  const avgOverall = (acousticNorm.overall + textNorm.overall) / 2;
  const band = getScoreBand(avgOverall);
  const { acoustic: wa, text: wt } = getDynamicWeights(avgOverall);

  const delivery = wa * acousticNorm.delivery + wt * textNorm.delivery;
  const language_use = wa * acousticNorm.language_use + wt * textNorm.language_use;
  const topic_dev = wa * acousticNorm.topic_dev + wt * textNorm.topic_dev;
  const overall = wa * acousticNorm.overall + wt * textNorm.overall;

  return {
    delivery: Number(clampTo30(delivery).toFixed(2)),
    language_use: Number(clampTo30(language_use).toFixed(2)),
    topic_dev: Number(clampTo30(topic_dev).toFixed(2)),
    overall: Number(clampTo30(overall).toFixed(2)),
    meta: {
      weights: { acoustic: wa, text: wt },
      band,
      normalized: {
        acoustic: acousticNorm,
        text: textNorm,
      },
    },
  };
}
