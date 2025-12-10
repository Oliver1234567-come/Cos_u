// backend/api/answer_enhancer/rubrics.ts

export type ExamType = "toefl" | "ielts" | "duolingo" | "pte";

/* ============================================================
   A. 分数档位（用于动态权重 / 提示文案）
   ============================================================ */

export interface ScoreBand {
  label: "Low" | "Mid" | "High";
  description: string;
  range: [number, number]; // 统一用 TOEFL 0–30 体系
}

export const scoreBands: ScoreBand[] = [
  {
    label: "Low",
    description:
      "流畅度明显不足，停顿多、信息量少，语法/用词错误频繁，整体表达不完整。",
    range: [0, 17],
  },
  {
    label: "Mid",
    description:
      "能基本流畅表达，大部分意思说清楚，但展开和细节不足，语法/词汇还有明显提升空间。",
    range: [18, 22],
  },
  {
    label: "High",
    description:
      "表达自然，结构清晰，语法/词汇准确度高，内容完整有细节，已接近或达到高分水平。",
    range: [23, 30],
  },
];

export function getScoreBand(overall: number): ScoreBand {
  const s = Math.max(0, Math.min(30, overall));
  return (
    scoreBands.find((b) => s >= b.range[0] && s <= b.range[1]) ||
    scoreBands[scoreBands.length - 1]
  );
}

/* ============================================================
   B. 文本 Rubric（三个维度的基础描述）
   ============================================================ */

export interface TextRubric {
  delivery: string;
  language_use: string;
  topic_dev: string;
}

export const genericTextRubric: TextRubric = {
  delivery:
    "语音语调自然清晰，节奏合理，停顿主要用于思考或结构，而不是被卡住；整体可以被考官轻松听懂。",
  language_use:
    "语法基本正确，句型有一定多样性，词汇能表达准确含义，有合适的搭配，不严重依赖极简单句反复堆砌。",
  topic_dev:
    "回答有清晰的结构（开头-理由/细节-收尾），有足够的信息密度和例子来支持观点，而不是空话/套话。",
};

/* ============================================================
   C. 题型 Rubrics（不同考试 + 题型的任务要求）
   ============================================================ */

export interface TaskRubricItem {
  name: string;
  requirement: string;
}

export const taskRubrics: Record<
  ExamType,
  Record<string, TaskRubricItem>
> = {
  toefl: {
    task1: {
      name: "TOEFL Task 1（Independent）",
      requirement:
        "37 秒左右的个人观点题。需要有明确立场 + 1个或者2 个左右理由 + 简单例子，句子紧凑，不宜长时间停顿。",
    },
    task2: {
      name: "TOEFL Task 2（Integrated）",
      requirement:
        "1 分钟综合题，需要准确转述阅读 + 听力的要点，并说明二者关系。听力部分要有清晰的观点句，逻辑清楚、关注逻辑词的使用是否准确，信息准确是关键。",
    },
    task3:{
      name: "TOEFL Task 3（Integrated）",
      requirement:
        "1 分钟综合题，需要准确转述阅读 + 听力的要点.听力部分的故事讲述要有条理性，能分得清开始经过和结果或者实验的背景过程和结论，逻辑清楚、关注逻辑词的使用是否准确。",
    },
    task4:{
      name: "TOEFL Task 4（Integrated）",
      requirement:
        "1 分钟综合题，听力部分要清晰说出两个分论点句，例子部分信息详实，逻辑清楚、关注逻辑词的使用是否准确。",
    }

  },

  ielts: {
    part1: {
      name: "IELTS Speaking Part 1",
      requirement:
        "轻松聊天风格，答案不需要太长，但要自然流利、直接回答问题，避免机械背诵感。",
    },
    part2: {
      name: "IELTS Speaking Part 2",
      requirement:
        "2 分钟长段表达。需要围绕话题展开，多给细节、故事、感受，体现持续表达能力。",
    },
    part3: {
      name: "IELTS Speaking Part 3",
      requirement:
        "更抽象/社会性问题，需要有原因分析、推理和扩展，而不仅仅是个人小故事。",
    },
  },
  duolingo: {
    readAndSpeak: {
      name: "Duolingo Read & Speak",
      requirement:
        "根据屏幕上的内容朗读或复述。要求发音清晰、节奏稳定，尽量减少读错和严重停顿。",
    },
    listenAndSpeak: {
      name: "Duolingo Listen & Speak",
      requirement:
        "听一段音频后复述要点，重点在于抓住关键信息并清晰说出。",
    },
  },
  pte: {
    describeImage: {
      name: "PTE Describe Image",
      requirement:
        "需要先给整体概括，再给 2–3 个关键细节，最后一句总结，结构性很重要。",
    },
    retellLecture: {
      name: "PTE Retell Lecture",
      requirement:
        "复述听力内容，表达主旨 + 支撑点 + 逻辑关系，比逐字复读更看重信息组织。",
    },
  },
};

export function getTaskRubric(
  exam: ExamType,
  taskType: string
): TaskRubricItem | null {
  const examSet = taskRubrics[exam];
  if (!examSet) return null;
  return examSet[taskType] || null;
}

/* ============================================================
   D. 分数档位详细 Rubrics（以 TOEFL 0–30 为基础）
   - 这里给一个可用默认版本，你可以以后慢慢细化中文/英文
   ============================================================ */

export interface ScoreLevelRubric {
  delivery: string;
  language_use: string;
  topic_dev: string;
  summary: string;
}

export const toeflScoreLevels: Record<number, ScoreLevelRubric> = {
  10: {
    delivery:
      "大量停顿和重复，语速很慢，很多句子无法完整说完，考官很难跟上你的表达。",
    language_use:
      "基本词汇为主，语法错误非常多，句子结构混乱，严重影响理解。",
    topic_dev:
      "几乎没能展开观点，信息量很少，很多时间都浪费在犹豫和重复上。",
    summary: "整体处于非常初级的口语表达水平，优先提升流畅度 + 基本句型。",
  },
  12: {
    delivery:
      "仍然有很多犹豫和停顿，但能说出一些完整句子，语速偏慢。",
    language_use:
      "常见语法错误仍然很多，词汇储备有限，表达比较生硬。",
    topic_dev:
      "有尝试表达观点，但细节和例子非常不足，很多地方只是在重复题目。",
    summary: "已经能在考场勉强表达，但信息量和准确度都远未达标。",
  },
  15: {
    delivery:
      "可以断断续续地说完整答案，但停顿、回头改句子、重复现象依然频繁。",
    language_use:
      "使用简单词汇和句型为主，语法错误影响了表达的清晰度。",
    topic_dev:
      "观点勉强清楚，细节和例子少，信息量偏低，缺乏清晰结构。",
    summary:
      "整体略好于完全不会，但离考试实用分数还有较大差距，优先提升流畅度和基本结构。",
  },
  18: {
    // 基于你给的“18 分段说明”压缩整理
    delivery:
      "流畅度是最大问题。停顿、重复、语气词（um, uh）非常多，语速较慢，一句话的信息量很低。",
    language_use:
      "语法错误频繁，主谓一致、时态、单复数经常出错，句子容易杂糅，几乎不使用复杂句。",
    topic_dev:
      "只讲出很少的观点和例子，信息密度很低，很多时间在重复和卡顿中消耗。",
    summary:
      "典型 18 分段：能开口说，但说得又慢又碎，错误多、信息少，delivery 是主要瓶颈。",
  },
  20: {
    delivery:
      "已有一定流畅度，能较完整说完答案，但停顿和小卡顿仍比较明显。",
    language_use:
      "简单句可以，大部分能被理解，但语法小错误和不自然表达仍然比较多。",
    topic_dev:
      "观点大致清楚，有一两个理由或例子，但展开不够深入，结构略显散乱。",
    summary:
      "勉强可用的分数段，已经能说出一段话，但要提升逻辑和准确度才能上 23+。",
  },
  23: {
    // 对应你描述的 22-23 分段
    delivery:
      "整体流畅，能持续说话，语速适中，偶尔有停顿或自我修正，但不影响整体理解。",
    language_use:
      "语法有少量错误，但不严重影响理解，有一定句型变化，开始使用一些更准确/地道的词汇。",
    topic_dev:
      "有明确观点和若干理由/例子，能较好回应题目，但在细节和层次感上还可以更扎实。",
    summary:
      "典型 22–23 分段：已经“能说好一题”，但距离更高分还缺少更自然的语调、更清晰的结构和更紧凑的信息。",
  },
  25: {
    delivery:
      "整体自然流畅，短暂停顿主要用于思考和结构安排，基本不会影响理解。",
    language_use:
      "语法总体准确，能使用多种句型和较丰富词汇，仅有少量细小问题。",
    topic_dev:
      "观点把握准确，有逻辑，有例子，信息量足够，但在亮点表达和高级结构上仍有提升空间。",
    summary:
      "已经是比较稳定的高分段表达，但要冲击 26–30，需要更好的语调控制和内容深度。",
  },
  26: {
    // 对应你给的 26 分段说明
    delivery:
      "语音语调整体优秀，发音问题很少，节奏自然，有明显但不过度的语调起伏，听感接近长时间可听的输入。",
    language_use:
      "语法总体正确，偶有小错但不影响理解，搭配和词汇选择多样且自然。",
    topic_dev:
      "观点清晰，有良好的结构和足够的细节支持，信息密度适中但可继续增加亮点。",
    summary:
      "典型 26 分段：综合表现很好，主要再通过更饱满的内容和更自然的语音语调提升到 28–30。",
  },
  28: {
    delivery:
      "极为自然的表达，语调灵活、重音得当，几乎没有影响理解的停顿或卡顿。",
    language_use:
      "表达接近母语者水平，能准确使用多种结构和搭配，错误极少且不系统性。",
    topic_dev:
      "内容充实，有清晰结构、有效例子和恰当的逻辑连接词，能给人“成熟、有说服力”的感觉。",
    summary:
      "非常强的口语表现，基本达到考试的优秀水平，略有细节可打磨到满分。",
  },
  30: {
    delivery:
      "接近母语者的自然度，语调、节奏、重音都非常自然，完全不影响理解。",
    language_use:
      "语法和词汇选择高度准确且灵活，能够自如表达复杂思想。",
    topic_dev:
      "结构严谨、内容饱满、例子贴切，论证逻辑清晰，有明显的“高分感”。",
    summary:
      "几乎理想化的答题表现，与考场中极少数考生的满分表现相当。",
  },
};

export function getScoreLevelRubric(
  examType: ExamType,
  targetScore: number
): ScoreLevelRubric | null {
  // 目前以 TOEFL 0–30 体系为基础，你之后可以按需扩展到其他考试独立描述
  if (examType === "toefl") {
    return toeflScoreLevels[targetScore] || null;
  }
  // 其他考试先沿用 TOEFL 的描述（你以后可以单独拆开）
  return toeflScoreLevels[targetScore] || null;
}
