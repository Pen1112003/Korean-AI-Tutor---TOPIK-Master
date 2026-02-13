
export interface LessonData {
  theme: string;
  date: string;
  summary: string[];
  vocabulary: VocabularyItem[];
  grammarPoints: GrammarPoint[];
  contextualSentences: string[];
  quiz: QuizItem[];
}

export interface VocabularyItem {
  hangul: string;
  hanja?: string;
  type: string;
  meaning: string;
  example: string;
}

export interface GrammarPoint {
  structure: string;
  usage: string;
  example: string;
  note: string;
}

export interface QuizItem {
  question: string;
  options?: string[];
  answer: string;
}

export interface ProcessingState {
  isLoading: boolean;
  error: string | null;
  result: string | null;
}

export interface SavedLesson {
  id: string;
  title: string;
  date: string;
  content: string;
  timestamp: number;
}
