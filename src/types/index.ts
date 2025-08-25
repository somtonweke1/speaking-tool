export interface SpeakingQuestion {
  id: string;
  category: 'business' | 'personal' | 'academic' | 'creative' | 'current-events';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  question: string;
  context?: string;
  timeLimit: number; // in seconds
  tips?: string[];
}

export interface SpeechAnalysis {
  volume: {
    average: number;
    min: number;
    max: number;
    consistency: number; // 0-100
  };
  clarity: {
    fillerWords: string[];
    fillerWordCount: number;
    speechRate: number; // words per minute
    articulation: number; // 0-100
  };
  coherence: {
    relevanceScore: number; // 0-100
    structureScore: number; // 0-100
    completenessScore: number; // 0-100
  };
  overallScore: number; // 0-100
}

export interface FeedbackItem {
  type: 'positive' | 'improvement' | 'critical';
  category: 'volume' | 'clarity' | 'coherence' | 'general';
  message: string;
  suggestion?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface SpeakingSession {
  id: string;
  questionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  analysis?: SpeechAnalysis;
  feedback: FeedbackItem[];
  recordingUrl?: string;
  transcript?: string;
}

export interface UserProgress {
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  categories: {
    [key: string]: {
      sessions: number;
      averageScore: number;
      improvement: number;
    };
  };
  streak: number; // consecutive days
}
