export interface ChuciData {
  title: string;
  section: string;
  author: string;
  content: string[];
}

export interface LunyuData {
  chapter: string;
  paragraphs: string[];
}

export interface PoetAndCiData {
  author: string;
  paragraphs: string[];
  // 诗是 title
  title?: string;
  // 词是 rhythmic
  rhythmic?: string;
}
