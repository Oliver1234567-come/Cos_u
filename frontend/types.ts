
export enum ViewState {
  ONBOARDING = 'ONBOARDING',
  HOME = 'HOME',
  RECORDING = 'RECORDING',
  EVALUATION = 'EVALUATION',
  STATS = 'STATS',
  COMMUNITY = 'COMMUNITY',
  PROFILE = 'PROFILE',
  PAYWALL = 'PAYWALL',
  VOICE_LAB = 'VOICE_LAB'
}

export enum ExamType {
  TOEFL = 'TOEFL',
  IELTS = 'IELTS',
  PTE = 'PTE',
  DUOLINGO = 'Duolingo',
  GENERAL = 'General English'
}

export interface UserProfile {
  name: string;
  nationality: string;
  ageGroup: string;
  examType: ExamType;
  targetScore: number;
  points: number;
  isPro: boolean;
}

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface CommunityPost {
  id: string;
  user: string;
  avatar: string; // URL
  score: string;
  likes: number;
  comments: number;
  topic: string;
}

export interface ScoreBreakdown {
  delivery: number;
  language_use: number;
  topic_dev: number;
  overall: number;
}

export interface FusionMeta {
  weights: { acoustic: number; text: number };
  band?: { label: string; description: string; range: [number, number] };
  normalized?: { acoustic: ScoreBreakdown; text: ScoreBreakdown };
}

export interface FinalScore extends ScoreBreakdown {
  meta?: FusionMeta;
}

export interface ExamUIScore {
  examType: string;
  overall: number;
  delivery: number;
  language_use: number;
  topic_dev: number;
}

export interface ScoreResponse {
  transcript: string;
  acoustic_score: ScoreBreakdown;
  text_score: ScoreBreakdown;
  final_score: FinalScore;
  exam_ui_score: ExamUIScore;
  improvements: string[];
}

export interface EvaluationState {
  loading: boolean;
  error: string | null;
  result: ScoreResponse | null;
}

export interface SampleAudioResponse {
  sample: string;
  audioBase64: string;
}
