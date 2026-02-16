
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum Currency {
  INR = 'INR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  type: 'quiz_count' | 'streak' | 'earnings' | 'expense_count';
  threshold: number;
}

export interface Subject {
  id: string;
  name: string;
  handoutName: string;
  handoutText: string;
  progress: number; // 0-100
  quizzesTaken: number;
  averageScore: number;
  lastAccessed: string;
  failedAttempts: number;
  lockoutUntil?: string;
}

export interface BudgetInsight {
  healthScore: number; // 0-100
  riskLevel: 'Safe' | 'Warning' | 'Critical';
  runwayDays: number;
  suggestions: string[];
  prediction: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  monthlyBudget: number;
  currency: Currency;
  unlockedBalance: number;
  totalEarned: number;
  streak: number;
  lastActive: string;
  achievements: Achievement[];
  customCategories: string[];
  subjects: Subject[];
  studyTimeMinutes: number;
}

export interface Question {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  subjectId: string;
  date: string;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  rewardEarned: number;
  timeTakenSeconds: number;
}

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export type Category = 'Food' | 'Travel' | 'Books' | 'Entertainment' | 'Others' | string;

// Added missing interface used in Leaderboard component
export interface LeaderboardEntry {
  id: string;
  name: string;
  totalEarned: number;
  streak: number;
}
