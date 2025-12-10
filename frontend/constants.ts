
import { CommunityPost, ExamType } from "./types";

export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: '1',
    user: 'Sarah J.',
    avatar: 'https://picsum.photos/id/64/200/200',
    score: '26/30',
    likes: 12,
    comments: 4,
    topic: 'Describe a memorable holiday'
  },
  {
    id: '2',
    user: 'Kenji M.',
    avatar: 'https://picsum.photos/id/91/200/200',
    score: '7.5',
    likes: 8,
    comments: 1,
    topic: 'Opinion on remote work'
  },
  {
    id: '3',
    user: 'Elena R.',
    avatar: 'https://picsum.photos/id/129/200/200',
    score: '78',
    likes: 24,
    comments: 6,
    topic: 'Discuss environmental issues'
  }
];

export const EXAM_OPTIONS = [
  { label: 'TOEFL', value: ExamType.TOEFL, max: 30 },
  { label: 'IELTS', value: ExamType.IELTS, max: 9 },
  { label: 'PTE', value: ExamType.PTE, max: 90 },
  { label: 'Duolingo', value: ExamType.DUOLINGO, max: 160 },
  { label: 'General', value: ExamType.GENERAL, max: 100 },
];

export const EXAM_TASKS: Record<ExamType, string[]> = {
  [ExamType.TOEFL]: ['Task 1 (Independent)', 'Task 2 (Campus)', 'Task 3 (Academic)', 'Task 4 (Academic Lecture)'],
  [ExamType.IELTS]: ['Part 2 (Long Turn)', 'Part 3 (Discussion)'],
  [ExamType.PTE]: ['Read Aloud', 'Repeat Sentence', 'Describe Image', 'Retell Lecture'],
  [ExamType.DUOLINGO]: ['Describe Image', 'Read Aloud', 'Speak about Photo'],
  [ExamType.GENERAL]: ['Daily Topic', 'Free Talk', 'Interview Prep', 'Debate'],
};

export const AGE_GROUPS = ["<16", "16-22", "22-35", "35+"];

// New Scalable Data Structures
export const CONTINENTS = [
  { id: 'asia', label: 'Asia', icon: 'Globe' },
  { id: 'europe', label: 'Europe', icon: 'Map' },
  { id: 'north_america', label: 'North America', icon: 'Compass' },
  { id: 'south_america', label: 'South America', icon: 'Sun' },
  { id: 'africa', label: 'Africa', icon: 'Sun' },
  { id: 'middle_east', label: 'Middle East', icon: 'Star' },
  { id: 'oceania', label: 'Oceania', icon: 'Anchor' },
];

export const COUNTRIES_BY_CONTINENT: Record<string, string[]> = {
  asia: ["China", "Japan", "South Korea", "Vietnam", "India", "Thailand", "Indonesia", "Malaysia", "Philippines", "Singapore", "Taiwan", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "Kazakhstan", "Uzbekistan", "Cambodia", "Myanmar", "Laos", "Mongolia"],
  europe: ["United Kingdom", "Germany", "France", "Italy", "Spain", "Netherlands", "Poland", "Sweden", "Norway", "Finland", "Denmark", "Belgium", "Switzerland", "Austria", "Portugal", "Greece", "Ireland", "Czech Republic", "Hungary", "Romania", "Ukraine", "Russia", "Turkey"],
  north_america: ["United States", "Canada", "Mexico", "Guatemala", "Cuba", "Haiti", "Dominican Republic", "Honduras", "El Salvador", "Nicaragua", "Costa Rica", "Panama", "Jamaica", "Trinidad and Tobago", "Bahamas", "Barbados"],
  south_america: ["Brazil", "Argentina", "Colombia", "Chile", "Peru", "Venezuela", "Ecuador", "Bolivia", "Paraguay", "Uruguay", "Guyana", "Suriname"],
  africa: ["Nigeria", "Ethiopia", "Egypt", "DR Congo", "Tanzania", "South Africa", "Kenya", "Uganda", "Algeria", "Sudan", "Morocco", "Angola", "Ghana", "Mozambique", "Madagascar", "Cameroon", "Ivory Coast", "Niger", "Senegal"],
  middle_east: ["Saudi Arabia", "Iran", "Iraq", "UAE", "Israel", "Jordan", "Lebanon", "Oman", "Kuwait", "Qatar", "Bahrain", "Yemen", "Syria"],
  oceania: ["Australia", "New Zealand", "Papua New Guinea", "Fiji", "Solomon Islands", "Vanuatu", "Samoa", "Kiribati", "Tonga"]
};
