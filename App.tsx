import React, { useState, useEffect } from 'react';
import { Currency, User, Expense, QuizAttempt, Difficulty, Achievement, Subject } from './types.ts';
import LandingPage from './components/LandingPage.tsx';
import Dashboard from './components/Dashboard.tsx';
import AuthPage from './components/AuthPage.tsx';
import QuizSection from './components/QuizSection.tsx';
import ExpenseTracker from './components/ExpenseTracker.tsx';
import Sidebar from './components/Sidebar.tsx';
import Leaderboard from './components/Leaderboard.tsx';
import SmartAssistant from './components/SmartAssistant.tsx';
import { api } from './services/api.ts';
import { CURRENCY_SYMBOLS, CONVERSION_RATES } from './constants.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'dashboard' | 'quiz' | 'expenses' | 'auth' | 'leaderboard' | 'assistant'>('landing');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const session = api.auth.getSession();
    if (session) {
      setUser(session);
      setExpenses(api.data.getExpenses(session.id));
      setQuizzes(api.data.getQuizzes(session.id));
      setView('dashboard');
    }
    const savedTheme = localStorage.getItem('l2e_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('l2e_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('l2e_theme', 'light');
    }
  }, [isDarkMode]);

  const handleAddSubject = async (newSub: Subject) => {
    if (!user) return;
    const updatedSubjects = [...user.subjects, newSub];
    const updatedUser = await api.user.update(user.id, { subjects: updatedSubjects });
    setUser(updatedUser);
  };

  const handleQuizComplete = async (attempt: QuizAttempt) => {
    if (!user) return;
    await api.data.saveQuiz(user.id, attempt);
    
    const accuracy = (attempt.score / attempt.totalQuestions) * 100;
    let updatedSubjects = [...user.subjects];
    const subIdx = updatedSubjects.findIndex(s => s.id === attempt.subjectId);

    if (subIdx !== -1) {
      const sub = { ...updatedSubjects[subIdx] };
      sub.quizzesTaken += 1;
      sub.averageScore = (sub.averageScore * (sub.quizzesTaken - 1) + accuracy) / sub.quizzesTaken;
      sub.progress = Math.min(100, sub.progress + (accuracy / 10));
      
      if (accuracy < 40) {
        sub.failedAttempts += 1;
        if (sub.failedAttempts >= 3) {
          const lockTime = new Date();
          lockTime.setHours(lockTime.getHours() + 24);
          sub.lockoutUntil = lockTime.toISOString();
          sub.failedAttempts = 0;
        }
      } else {
        sub.failedAttempts = 0;
      }
      updatedSubjects[subIdx] = sub;
    }

    const updatedUser = await api.user.update(user.id, {
      unlockedBalance: user.unlockedBalance + attempt.rewardEarned,
      totalEarned: user.totalEarned + attempt.rewardEarned,
      lastActive: new Date().toDateString(),
      subjects: updatedSubjects,
      studyTimeMinutes: user.studyTimeMinutes + (attempt.timeTakenSeconds / 60)
    });

    setUser(updatedUser);
    setQuizzes(api.data.getQuizzes(user.id));
    setView('dashboard');
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'date' | 'userId'>) => {
    if (!user) return;
    if (expense.amount > user.unlockedBalance) {
      alert("Insufficient unlocked rewards! Complete more technical quizzes to access your income.");
      return;
    }
    const newExp = await api.data.saveExpense(user.id, expense);
    const updatedUser = await api.user.update(user.id, {
      unlockedBalance: user.unlockedBalance - expense.amount
    });
    setUser(updatedUser);
    setExpenses(api.data.getExpenses(user.id));
  };

  const formatValue = (val: number) => {
    if (!user) return `${val}`;
    const rate = CONVERSION_RATES[user.currency];
    const converted = val * rate;
    return `${CURRENCY_SYMBOLS[user.currency]}${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      {view === 'landing' && <LandingPage onEnter={() => setView('auth')} />}
      {view === 'auth' && <AuthPage onAuth={(u) => { setUser(u); setView('dashboard'); }} onBack={() => setView('landing')} />}

      {user && (
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar 
            activeView={view} 
            setView={setView} 
            onLogout={() => { api.auth.logout(); setUser(null); setView('landing'); }} 
            isDarkMode={isDarkMode} 
            toggleTheme={() => setIsDarkMode(!isDarkMode)} 
          />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-900">
            {view === 'dashboard' && (
              <Dashboard 
                user={user} expenses={expenses} quizzes={quizzes} 
                formatValue={formatValue} updateBudget={(b) => api.user.update(user.id, { monthlyBudget: b }).then(setUser)} 
                setUser={setUser}
              />
            )}
            {view === 'quiz' && (
              <QuizSection 
                user={user} 
                onQuizComplete={handleQuizComplete} 
                onAddSubject={handleAddSubject}
              />
            )}
            {view === 'expenses' && (
              <ExpenseTracker 
                expenses={expenses} unlockedBalance={user.unlockedBalance} 
                addExpense={handleAddExpense} formatValue={formatValue} 
                user={user} onUpdateUser={setUser}
              />
            )}
            {view === 'assistant' && <SmartAssistant user={user} onUpdateUser={setUser} />}
            {view === 'leaderboard' && <Leaderboard currentUser={user} formatValue={formatValue} />}
          </main>
        </div>
      )}
    </div>
  );
};

export default App;