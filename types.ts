
export interface SlideContent {
  english: string;
  chinese: string;
}

export interface WordSlideContent {
  word: string;
  ex1_english: string;
  ex1_chinese: string;
  ex2_english: string;
  ex2_chinese: string;
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
