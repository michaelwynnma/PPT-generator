
export interface SentenceSegment {
  en: string;
  cn: string;
}

export interface SlideContent {
  segments: SentenceSegment[];
}

export interface WordExampleSegment {
  en: string; // English word/phrase
  cn: string; // Chinese correspondence
}

export interface WordSlideContent {
  word: string;
  ex1_segments: WordExampleSegment[];
  ex2_segments: WordExampleSegment[];
}

export interface WordCardItem {
  english: string;
  phonetic: string;
  chinese: string;
}

export interface WordCardGridSlide {
  items: WordCardItem[]; // Max 4 items per slide
}

export type GeneratedContent = SlideContent | WordSlideContent | WordCardGridSlide;

export enum AppMode {
  SENTENCE_PAIRS = 'SENTENCE_PAIRS',
  WORD_EXAMPLES = 'WORD_EXAMPLES',
  WORD_CARDS = 'WORD_CARDS'
}

export interface GenerationConfig {
  sourceText: string;
  mode: AppMode;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface GeneratedFile {
  id: string;
  name: string;
  mode: AppMode;
  timestamp: number;
  slides: GeneratedContent[];
}
