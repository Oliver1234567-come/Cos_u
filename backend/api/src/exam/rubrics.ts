// backend/api/src/exam/rubrics.ts

import { ExamType } from "../types/exam";

/* ============================================================
   A. Score Bands (for dynamic weighting / prompt text)
   ============================================================ */

export interface ScoreBand {
  label: "Low" | "Mid" | "High";
  description: string;
  range: [number, number]; // Unified TOEFL 0–30 scale
}

export const scoreBands: ScoreBand[] = [
  {
    label: "Low",
    description:
      "Significant lack of fluency, frequent pauses, limited information, frequent grammar/vocabulary errors, incomplete overall expression.",
    range: [0, 17],
  },
  {
    label: "Mid",
    description:
      "Can express ideas with basic fluency, most meaning is clear, but lacks development and details. Grammar/vocabulary still has significant room for improvement.",
    range: [18, 22],
  },
  {
    label: "High",
    description:
      "Natural expression, clear structure, high accuracy in grammar/vocabulary, complete content with details, approaching or reaching high score level.",
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
   B. Text Rubric (basic descriptions for three dimensions)
   ============================================================ */

export interface TextRubric {
  delivery: string;
  language_use: string;
  topic_dev: string;
}

export const genericTextRubric: TextRubric = {
  delivery:
    "Natural and clear pronunciation and intonation, reasonable rhythm, pauses mainly for thinking or structure rather than being stuck; overall can be easily understood by examiners.",
  language_use:
    "Grammar is basically correct, sentence patterns have some variety, vocabulary can express accurate meanings with appropriate collocations, not heavily relying on extremely simple sentences repeatedly.",
  topic_dev:
    "Response has clear structure (opening-reasons/details-conclusion), sufficient information density and examples to support viewpoints, rather than empty words/formulaic phrases.",
};

/* ============================================================
   C. Task Rubrics (task requirements for different exams + task types)
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
      name: "TOEFL Task 1 (Independent)",
      requirement:
        "Approximately 37 seconds personal opinion question. Requires clear position + 1 or 2 reasons + simple examples, compact sentences, avoid long pauses.",
    },
    task2: {
      name: "TOEFL Task 2 (Integrated)",
      requirement:
        "1 minute integrated task, need to accurately restate key points from reading + listening, and explain their relationship. Listening part should have clear opinion sentences, clear logic, pay attention to whether logical words are used accurately, information accuracy is key.",
    },
    task3: {
      name: "TOEFL Task 3 (Integrated)",
      requirement:
        "1 minute integrated task, need to accurately restate key points from reading + listening. The story narration in the listening part should be organized, able to distinguish beginning, process, and result, or background, process, and conclusion of experiments, clear logic, pay attention to whether logical words are used accurately.",
    },
    task4: {
      name: "TOEFL Task 4 (Integrated)",
      requirement:
        "1 minute integrated task, listening part should clearly state two sub-point sentences, example part should have detailed information, clear logic, pay attention to whether logical words are used accurately.",
    },
  },

  ielts: {
    part1: {
      name: "IELTS Speaking Part 1",
      requirement:
        "Casual conversation style, answers don't need to be too long, but should be natural and fluent, directly answer questions, avoid mechanical memorization feel.",
    },
    part2: {
      name: "IELTS Speaking Part 2",
      requirement:
        "2 minute long-form expression. Need to develop around the topic, provide many details, stories, feelings, demonstrate sustained speaking ability.",
    },
    part3: {
      name: "IELTS Speaking Part 3",
      requirement:
        "More abstract/social questions, need cause analysis, reasoning and expansion, not just personal small stories.",
    },
  },
  duolingo: {
    readAndSpeak: {
      name: "Duolingo Read & Speak",
      requirement:
        "Read or retell content from screen. Requires clear pronunciation, stable rhythm, minimize reading errors and serious pauses.",
    },
    listenAndSpeak: {
      name: "Duolingo Listen & Speak",
      requirement:
        "Listen to audio then retell key points, focus on capturing key information and speaking clearly.",
    },
  },
  pte: {
    describeImage: {
      name: "PTE Describe Image",
      requirement:
        "Need to give overall summary first, then 2–3 key details, finally a concluding sentence, structure is very important.",
    },
    retellLecture: {
      name: "PTE Retell Lecture",
      requirement:
        "Retell listening content, express main idea + supporting points + logical relationships, focus more on information organization than word-for-word repetition.",
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

export function normalizeExamAndTask(
  examType: string,
  taskType: string
): { exam: ExamType; task: string } {
  const normalizedExam = examType.toLowerCase() as ExamType;
  const validExams: ExamType[] = ["toefl", "ielts", "pte", "duolingo"];
  const exam = validExams.includes(normalizedExam) ? normalizedExam : "toefl";
  return { exam, task: taskType || "task1" };
}

/* ============================================================
   D. Score Level Rubric (for target score descriptions)
   ============================================================ */

export interface ScoreLevelRubric {
  delivery: string;
  language_use: string;
  topic_dev: string;
  summary: string;
}

/**
 * Get rubric description for a specific target score level
 */
export function getScoreLevelRubric(
  examType: ExamType,
  targetScore: number
): ScoreLevelRubric | null {
  const score = Math.max(0, Math.min(30, targetScore));
  const band = getScoreBand(score);

  // Base descriptions by score band
  const lowLevel: ScoreLevelRubric = {
    delivery:
      "Basic pronunciation, some pauses and hesitations, but generally understandable. Rhythm may be uneven.",
    language_use:
      "Simple sentence structures, basic vocabulary, some grammar errors but meaning is mostly clear.",
    topic_dev:
      "Basic structure present, some supporting details, but may lack depth or clear organization.",
    summary:
      "Adequate response that addresses the task with basic fluency and accuracy.",
  };

  const midLevel: ScoreLevelRubric = {
    delivery:
      "Clear pronunciation, mostly smooth flow with occasional pauses. Good rhythm and intonation patterns.",
    language_use:
      "Varied sentence structures, appropriate vocabulary choices, minor grammar errors that don't impede understanding.",
    topic_dev:
      "Well-organized response with clear structure, sufficient details and examples to support main points.",
    summary:
      "Good response that demonstrates solid language skills and effective communication.",
  };

  const highLevel: ScoreLevelRubric = {
    delivery:
      "Natural pronunciation, smooth and fluent delivery, appropriate pauses for emphasis, excellent rhythm and intonation.",
    language_use:
      "Sophisticated sentence structures, precise vocabulary, high grammatical accuracy with minimal errors.",
    topic_dev:
      "Excellent organization with clear structure, rich details, compelling examples, and strong logical flow.",
    summary:
      "Outstanding response that demonstrates advanced language proficiency and effective communication.",
  };

  // Return appropriate level based on score band
  if (band.label === "Low") {
    return lowLevel;
  } else if (band.label === "Mid") {
    return midLevel;
  } else {
    return highLevel;
  }
}
