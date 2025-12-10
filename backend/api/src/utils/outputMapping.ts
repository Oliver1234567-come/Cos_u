// backend/api/src/utils/outputMapping.ts

/* ============================================================
   1) 不同考试的分数区间
   ============================================================ */

   export const examRanges = {
    toefl: { min: 0, max: 30 },
    ielts: { min: 0, max: 9 },
    pte: { min: 10, max: 90 },
    duolingo: { min: 10, max: 160 },
  };
  
  export type ExamType = keyof typeof examRanges;
  
  /* ============================================================
     2) TOEFL → 其他考试的映射（简单线性等比）
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
     3) 把 TOEFL 子项维度映射到目标考试
     ============================================================ */
  
  export function mapDimensionScore(
    toeflScore: number,
    examType: ExamType
  ): number | string {
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
     4) 最终 UI 显示结构
     ============================================================ */
  
  export function mapFinalScoreToUI(
    raw: {
      final_score: {
        overall: number;
        delivery: number;
        language_use: number;
        topic_dev: number;
      };
      transcript: string;
      improvements: string[];
    },
    examType: ExamType
  ) {
    const { overall, delivery, language_use, topic_dev } = raw.final_score;
  
    // 映射
    const mappedOverall = mapDimensionScore(overall, examType);
    const mappedDelivery = mapDimensionScore(delivery, examType);
    const mappedLanguage = mapDimensionScore(language_use, examType);
    const mappedTopicDev = mapDimensionScore(topic_dev, examType);
  
    return {
      examType,
      totalRange: examRanges[examType],
      overall: {
        value: mappedOverall,
        raw: overall,
      },
      dimensions: {
        delivery: mappedDelivery,
        language_use: mappedLanguage,
        topic_dev: mappedTopicDev,
      },
      transcript: raw.transcript,
      improvements: raw.improvements,
    };
  }
  