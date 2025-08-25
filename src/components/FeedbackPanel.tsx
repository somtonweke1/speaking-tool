import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Volume2, Clock, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { SpeechAnalysis, FeedbackItem } from '../types/index';

interface FeedbackPanelProps {
  analysis: SpeechAnalysis | null;
  isVisible: boolean;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ analysis, isVisible }) => {
  if (!analysis || !isVisible) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5" />;
    if (score >= 80) return <TrendingUp className="w-5 h-5" />;
    if (score >= 70) return <AlertCircle className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const getFeedbackTypeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-l-green-500 bg-green-50 text-green-800';
      case 'improvement': return 'border-l-yellow-500 bg-yellow-50 text-yellow-800';
      case 'critical': return 'border-l-red-500 bg-red-50 text-red-800';
      default: return 'border-l-gray-500 bg-gray-50 text-gray-800';
    }
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="w-5 h-5" />;
      case 'improvement': return <TrendingUp className="w-5 h-5" />;
      case 'critical': return <AlertCircle className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  // Calculate derived scores
  const volumeScore = Math.round(analysis.volume.consistency);
  const speechRateScore = analysis.clarity.speechRate > 0 ? Math.min(100, Math.max(0, 100 - Math.abs(analysis.clarity.speechRate - 150) / 1.5)) : 0;
  const clarityScore = Math.round(analysis.clarity.articulation);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Session Results</h2>
          <div className={`px-4 py-2 rounded-full text-white font-bold text-lg ${getScoreColor(analysis.overallScore).replace('text-', 'bg-').replace('bg-green-50', 'bg-green-500').replace('bg-blue-50', 'bg-blue-500').replace('bg-yellow-50', 'bg-yellow-500').replace('bg-red-50', 'bg-red-500')}`}>
            {analysis.overallScore}%
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Volume2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{volumeScore}%</div>
            <div className="text-sm text-gray-600">Volume</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(speechRateScore)}%</div>
            <div className="text-sm text-gray-600">Pace</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{clarityScore}%</div>
            <div className="text-sm text-gray-600">Clarity</div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Speech Rate</span>
            <span className="font-medium text-gray-900">{analysis.clarity.speechRate} words/min</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Filler Words</span>
            <span className="font-medium text-gray-900">{analysis.clarity.fillerWordCount} detected</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Volume Consistency</span>
            <span className="font-medium text-gray-900">{analysis.volume.consistency}%</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Articulation</span>
            <span className="font-medium text-gray-900">{analysis.clarity.articulation}%</span>
          </div>
        </div>

        {/* Coherence Scores */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{analysis.coherence.relevanceScore}%</div>
              <div className="text-sm text-gray-600">Relevance</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{analysis.coherence.structureScore}%</div>
              <div className="text-sm text-gray-600">Structure</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{analysis.coherence.completenessScore}%</div>
              <div className="text-sm text-gray-600">Completeness</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6 pt-6 border-t border-gray-200">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Practice Again
          </button>
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FeedbackPanel;
