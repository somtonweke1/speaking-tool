import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, BarChart3, BookOpen, Trophy, Settings, LogOut, User } from 'lucide-react';
import SpeakingSession from './components/SpeakingSession';
import ProgressDashboard from './components/ProgressDashboard';
import QuestionLibrary from './components/QuestionLibrary';
import Achievements from './components/Achievements';
import SettingsPanel from './components/SettingsPanel';

import AuthContainer from './components/Auth/AuthContainer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProgress } from './types/index';
import { SupabaseProgress } from './config/api';

type AppView = 'session' | 'progress' | 'library' | 'achievements' | 'settings';

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('session');
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalSessions: 0,
    averageScore: 0,
    bestScore: 0,
    categories: {},
    streak: 0
  });

  // Load user progress from Supabase on app start
  useEffect(() => {
    const loadProgress = async () => {
      if (user?.id) {
        const result = await SupabaseProgress.getProgress(user.id);
        if (result.success) {
          setUserProgress({
            totalSessions: result.progress.total_sessions,
            averageScore: result.progress.average_score,
            bestScore: result.progress.best_score,
            categories: {},
            streak: result.progress.streak
          });
        }
      }
    };
    loadProgress();
  }, [user]);

  // Save user progress to Supabase whenever it changes
  useEffect(() => {
    const saveProgress = async () => {
      if (user?.id) {
        await SupabaseProgress.updateProgress(user.id, {
          total_sessions: userProgress.totalSessions,
          average_score: userProgress.averageScore,
          best_score: userProgress.bestScore,
          streak: userProgress.streak
        });
      }
    };
    saveProgress();
  }, [userProgress, user]);

  const updateProgress = (newProgress: Partial<UserProgress>) => {
    setUserProgress(prev => ({ ...prev, ...newProgress }));
  };

  const handleLogout = () => {
    logout();
    setCurrentView('session');
  };

  const navigationItems = [
    { id: 'session', label: 'Practice', icon: Mic, color: 'text-blue-600' },
    { id: 'progress', label: 'Progress', icon: BarChart3, color: 'text-green-600' },
    { id: 'library', label: 'Questions', icon: BookOpen, color: 'text-purple-600' },
    { id: 'achievements', label: 'Achievements', icon: Trophy, color: 'text-yellow-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600' },

  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'session':
        return <SpeakingSession onProgressUpdate={updateProgress} />;
      case 'progress':
        return <ProgressDashboard progress={userProgress} />;
      case 'library':
        return <QuestionLibrary />;
      case 'achievements':
        return <Achievements progress={userProgress} />;
      case 'settings':
        return <SettingsPanel />;

      default:
        return <SpeakingSession onProgressUpdate={updateProgress} />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SpeakingTool...</p>
        </div>
      </div>
    );
  }

  // Show authentication if user is not logged in
  if (!user) {
    return <AuthContainer onAuthSuccess={() => {}} />;
  }

  // Show main app if user is logged in
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  <span className="text-blue-600">Speaking</span>Tool
                </h1>
              </div>
            </div>
            
            {/* User Info and Quick Stats */}
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Sessions</div>
                  <div className="text-lg font-semibold text-gray-900">{userProgress.totalSessions}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Best Score</div>
                  <div className="text-lg font-semibold text-gray-900">{userProgress.bestScore}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Streak</div>
                  <div className="text-lg font-semibold text-gray-900">{userProgress.streak} days</div>
                </div>
              </div>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as AppView)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>SpeakingTool - Master the art of public speaking</p>
            <p className="mt-2">Practice, improve, and excel in your communication skills</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
