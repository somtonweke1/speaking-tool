import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap, Award, Lock } from 'lucide-react';
import { UserProgress } from '../types/index';

interface AchievementsProps {
  progress: UserProgress;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  condition: (progress: UserProgress) => boolean;
  points: number;
}

const Achievements: React.FC<AchievementsProps> = ({ progress }) => {
  const achievements: Achievement[] = [
    {
      id: 'first-session',
      title: 'First Steps',
      description: 'Complete your first speaking session',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      condition: (p) => p.totalSessions >= 1,
      points: 10
    },
    {
      id: 'consistency',
      title: 'Consistency King',
      description: 'Complete 5 sessions',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      condition: (p) => p.totalSessions >= 5,
      points: 25
    },
    {
      id: 'dedication',
      title: 'Dedicated Speaker',
      description: 'Complete 10 sessions',
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      condition: (p) => p.totalSessions >= 10,
      points: 50
    },
    {
      id: 'excellence',
      title: 'Excellence',
      description: 'Achieve a score of 90% or higher',
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      condition: (p) => p.bestScore >= 90,
      points: 100
    },
    {
      id: 'streak-3',
      title: 'Getting Started',
      description: 'Maintain a 3-day streak',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      condition: (p) => p.streak >= 3,
      points: 30
    },
    {
      id: 'streak-7',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: Zap,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      condition: (p) => p.streak >= 7,
      points: 75
    },
    {
      id: 'streak-30',
      title: 'Monthly Master',
      description: 'Maintain a 30-day streak',
      icon: Trophy,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      condition: (p) => p.streak >= 30,
      points: 200
    },
    {
      id: 'improvement',
      title: 'Continuous Improvement',
      description: 'Improve your average score by 20%',
      icon: Target,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      condition: (p) => p.averageScore >= 70,
      points: 150
    }
  ];

  const unlockedAchievements = achievements.filter(achievement => achievement.condition(progress));
  const totalPoints = unlockedAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
  const completionPercentage = (unlockedAchievements.length / achievements.length) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
        <p className="text-gray-600">Unlock badges and track your progress</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{unlockedAchievements.length}</div>
            <div className="text-sm text-gray-600">Achievements Unlocked</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(completionPercentage)}%</div>
            <div className="text-sm text-gray-600">Completion</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{unlockedAchievements.length} / {achievements.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement, index) => {
          const isUnlocked = achievement.condition(progress);
          const Icon = achievement.icon;
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-lg border transition-all duration-300 ${
                isUnlocked
                  ? `${achievement.bgColor} border-gray-200 shadow-md`
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              {/* Achievement Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isUnlocked ? achievement.bgColor : 'bg-gray-200'
                }`}>
                  {isUnlocked ? (
                    <Icon className={`w-6 h-6 ${achievement.color}`} />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    isUnlocked ? achievement.color : 'text-gray-400'
                  }`}>
                    {achievement.points} pts
                  </div>
                  {isUnlocked && (
                    <div className="text-xs text-green-600 font-medium">✓ Unlocked</div>
                  )}
                </div>
              </div>

              {/* Achievement Content */}
              <h3 className={`text-lg font-semibold mb-2 ${
                isUnlocked ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {achievement.title}
              </h3>
              <p className={`text-sm ${
                isUnlocked ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {achievement.description}
              </p>

              {/* Progress Indicator */}
              {!isUnlocked && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Progress to unlock:</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-gray-300 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {unlockedAchievements.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Trophy className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
          <p className="text-gray-600 mb-4">Start practicing to unlock your first achievement!</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Start Practicing
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Achievements;
