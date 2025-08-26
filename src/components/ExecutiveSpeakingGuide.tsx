import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Target, Zap, TrendingUp, Volume2, Mic, Lightbulb, Star } from 'lucide-react';

interface ExecutiveSpeakingGuideProps {
  onClose: () => void;
}

const ExecutiveSpeakingGuide: React.FC<ExecutiveSpeakingGuideProps> = ({ onClose }) => {
  const executiveTips = [
    {
      icon: Crown,
      title: "Executive Presence",
      description: "Your accent is your unique leadership signature. Project it with authority.",
      tips: [
        "Speak from your diaphragm, not your throat",
        "Use strategic pauses for impact",
        "Maintain steady eye contact",
        "Your accent shows global perspective"
      ]
    },
    {
      icon: Target,
      title: "Confidence Building",
      description: "Transform soft-spoken into powerfully expressive.",
      tips: [
        "Practice power poses before speaking",
        "Record yourself and celebrate progress",
        "Focus on message, not accent",
        "Your ideas have value - deliver with conviction"
      ]
    },
    {
      icon: Zap,
      title: "Accent Empowerment",
      description: "Your accent is your competitive advantage in global business.",
      tips: [
        "International executives value diverse perspectives",
        "Your accent shows cultural intelligence",
        "Clear communication > perfect accent",
        "Own your unique voice with pride"
      ]
    },
    {
      icon: TrendingUp,
      title: "Strategic Communication",
      description: "Express complex ideas with clarity and impact.",
      tips: [
        "Use the Executive STAR method",
        "Structure: Context → Recommendation → Outcome",
        "Pause for emphasis on key points",
        "Speed ≠ Power, Clarity = Authority"
      ]
    }
  ];

  const dailyExercises = [
    {
      title: "Morning Power Voice",
      description: "Start each day with 5 minutes of vocal warm-ups",
      duration: "5 minutes",
      focus: "Projection & Confidence"
    },
    {
      title: "Accent Celebration",
      description: "Practice speaking your native phrases with pride",
      duration: "10 minutes",
      focus: "Accent Empowerment"
    },
    {
      title: "Executive Storytelling",
      description: "Tell a business story using strategic pauses",
      duration: "15 minutes",
      focus: "Strategic Communication"
    },
    {
      title: "Boardroom Practice",
      description: "Present to an imaginary executive audience",
      duration: "20 minutes",
      focus: "Executive Presence"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Executive Speaking Mastery</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xl mt-2 opacity-90">
            Transform your speaking skills to consultant and executive level
          </p>
        </div>

        <div className="p-6">
          {/* Key Principles */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              Core Principles for Executive Success
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {executiveTips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200"
                >
                  <div className="flex items-center mb-4">
                    <tip.icon className="w-8 h-8 text-blue-600 mr-3" />
                    <h4 className="text-xl font-semibold text-gray-800">{tip.title}</h4>
                  </div>
                  <p className="text-gray-600 mb-4">{tip.description}</p>
                  <ul className="space-y-2">
                    {tip.tips.map((tipText, tipIndex) => (
                      <li key={tipIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{tipText}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Daily Exercises */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Target className="w-6 h-6 text-green-500 mr-2" />
              Daily Executive Speaking Exercises
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {dailyExercises.map((exercise, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-800">{exercise.title}</h4>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {exercise.duration}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{exercise.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                    <span>Focus: {exercise.focus}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Accent Empowerment Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Zap className="w-6 h-6 text-green-600 mr-2" />
              Your Accent is Your Power
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Why Your Accent Matters:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Shows global business experience</li>
                  <li>• Demonstrates cultural intelligence</li>
                  <li>• Sets you apart in international markets</li>
                  <li>• Adds authenticity to your message</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Accent Confidence Tips:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Practice your native phrases with pride</li>
                  <li>• Use your accent to emphasize key points</li>
                  <li>• Remember: clarity > perfect pronunciation</li>
                  <li>• Your accent tells your unique story</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Executive Communication Framework */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 text-purple-600 mr-2" />
              Executive Communication Framework
            </h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Strategic Opening (30 seconds)</h4>
                <p className="text-gray-600">"Here's the situation we're facing..."</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Core Recommendation (2-3 minutes)</h4>
                <p className="text-gray-600">"Here's my recommendation..."</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Expected Outcome (30 seconds)</h4>
                <p className="text-gray-600">"Here's what we can expect..."</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              🚀 Start Your Executive Practice
            </motion.button>
            <p className="text-gray-600 mt-4">
              Remember: Every great speaker started exactly where you are. Your journey to executive-level communication begins now.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ExecutiveSpeakingGuide;
