export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isError?: boolean;
}

export enum AppMode {
  GENERATOR = 'GENERATOR',
  DEBUGGER = 'DEBUGGER',
  REFACTOR = 'REFACTOR',
  EXPLAINER = 'EXPLAINER'
}

export interface CodeSnippet {
  language: string;
  code: string;
  filename: string;
}

export type UserTier = 'FREE' | 'PRO';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}