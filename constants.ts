
import { Difficulty, Currency, Achievement } from './types';

export const REWARD_RATES = {
  [Difficulty.EASY]: 10,
  [Difficulty.MEDIUM]: 20,
  [Difficulty.HARD]: 40,
};

export const CURRENCY_SYMBOLS = {
  [Currency.INR]: '₹',
  [Currency.USD]: '$',
  [Currency.EUR]: '€',
  [Currency.GBP]: '£',
};

export const CONVERSION_RATES = {
  [Currency.INR]: 1,
  [Currency.USD]: 0.012,
  [Currency.EUR]: 0.011,
  [Currency.GBP]: 0.0094,
};

export const DEFAULT_CATEGORIES = ['Food', 'Travel', 'Books', 'Entertainment', 'Others'];

export const ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Scholar Bound', description: 'Complete your first quiz session.', icon: '🎓', type: 'quiz_count', threshold: 1 },
  { id: '2', title: 'Steady Learner', description: 'Maintain a 3-day learning streak.', icon: '🔥', type: 'streak', threshold: 3 },
  { id: '3', title: 'Silver Earner', description: 'Earn a total of 500 in rewards.', icon: '🥈', type: 'earnings', threshold: 500 },
  { id: '4', title: 'Expense Master', description: 'Log at least 10 different expenditures.', icon: '📜', type: 'expense_count', threshold: 10 },
  { id: '5', title: 'Hardcore Studier', description: 'Complete 10 quizzes successfully.', icon: '🧠', type: 'quiz_count', threshold: 10 },
];
