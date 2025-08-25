import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Play, Square, RotateCcw, Volume2, VolumeX, AlertCircle, Lightbulb } from 'lucide-react';
import { SpeakingQuestion, SpeechAnalysis, FeedbackItem, UserProgress } from '../types/index';
import { getRandomQuestion } from '../data/questions';
import { SpeechAnalyzer } from '../utils/speechAnalysis';
import { SpeechRecognitionManager } from '../utils/speechRecognition';
import Timer from './Timer';
import VolumeVisualizer from './VolumeVisualizer';
import FeedbackPanel from './FeedbackPanel';

interface SpeakingSessionProps {
  onProgressUpdate: (progress: Partial<UserProgress>) => void;
}

const SpeakingSession: React.FC<SpeakingSessionProps> = ({ onProgressUpdate }) => {
  const [sessionState, setSessionState] = useState<'idle' | 'preparing' | 'speaking' | 'analyzing' | 'results'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState<SpeakingQuestion | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // Default 5 minutes
  const [transcript, setTranscript] = useState<string>('');
  const [analysis, setAnalysis] = useState<SpeechAnalysis | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [error, setError] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  
  // Real-time feedback states
  const [liveFeedback, setLiveFeedback] = useState<FeedbackItem[]>([]);
  const [fillerWordCount, setFillerWordCount] = useState<number>(0);
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(0);
  
  const speechAnalyzer = useRef<SpeechAnalyzer | null>(null);
  const speechRecognition = useRef<SpeechRecognitionManager | null>(null);
  const sessionStartTime = useRef<Date | null>(null);
  const sessionDuration = useRef<number>(0);
  const analysisInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize speech recognition and analyzer
    if (isSpeechRecognitionSupported()) {
      speechRecognition.current = new SpeechRecognitionManager();
      speechRecognition.current.setTranscriptUpdateCallback(setTranscript);
      speechRecognition.current.setFinalTranscriptCallback((finalTranscript) => {
        setTranscript(finalTranscript);
      });
      speechRecognition.current.setErrorCallback((error) => {
        setError(`Speech recognition error: ${error}`);
      });
    } else {
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }

    speechAnalyzer.current = new SpeechAnalyzer();

    return () => {
      if (speechRecognition.current) {
        speechRecognition.current.destroy();
      }
      if (speechAnalyzer.current) {
        speechAnalyzer.current.cleanup();
      }
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    };
  }, []);

  const startNewSession = async () => {
    try {
      setError('');
      setTranscript('');
      setAnalysis(null);
      setFeedback([]);
      setLiveFeedback([]);
      setFillerWordCount(0);
      setCurrentVolume(0);
      setSpeechRate(0);
      
      const question = getRandomQuestion();
      setCurrentQuestion(question);
      // Allow longer speaking time - minimum 5 minutes, can be extended
      setTimeRemaining(Math.max(300, question.timeLimit)); // At least 5 minutes
      setSessionState('preparing');
      
      // Initialize speech analyzer
      if (speechAnalyzer.current) {
        await speechAnalyzer.current.initialize();
      }
      
      // Start countdown
      setTimeout(() => {
        setSessionState('speaking');
        startSpeaking();
      }, 3000);
      
    } catch (error) {
      setError('Failed to start session. Please check your microphone permissions.');
    }
  };

  const startSpeaking = () => {
    if (!speechRecognition.current || !speechAnalyzer.current) return;
    
    setIsRecording(true);
    sessionStartTime.current = new Date();
    
    // Start speech recognition
    speechRecognition.current.startListening();
    
    // Start speech analysis
    speechAnalyzer.current.startRecording();
    
    // Start real-time analysis every 10 seconds
    analysisInterval.current = setInterval(() => {
      generateLiveFeedback();
    }, 10000);
    
    // Start timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          stopSpeaking();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const generateLiveFeedback = () => {
    if (!transcript || transcript.length < 10) return;
    
    const newFeedback: FeedbackItem[] = [];
    
    // Analyze filler words in real-time
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'sort of', 'kind of'];
    const words = transcript.toLowerCase().split(/\s+/);
    const currentFillerCount = words.filter(word => fillerWords.includes(word)).length;
    
    if (currentFillerCount > fillerWordCount) {
      newFeedback.push({
        type: 'improvement',
        category: 'clarity',
        message: `Filler word detected: "${words.find(word => fillerWords.includes(word))}"`,
        suggestion: 'Try pausing instead of using filler words. Take a breath and continue.',
        priority: 'medium'
      });
      setFillerWordCount(currentFillerCount);
    }
    
    // Analyze speech rate
    const currentSpeechRate = Math.round((words.length / (sessionDuration.current / 60)));
    if (currentSpeechRate > 200) {
      newFeedback.push({
        type: 'improvement',
        category: 'clarity',
        message: 'Speaking too fast',
        suggestion: 'Slow down your pace. Aim for 150-180 words per minute for clarity.',
        priority: 'medium'
      });
    } else if (currentSpeechRate < 100) {
      newFeedback.push({
        type: 'improvement',
        category: 'clarity',
        message: 'Speaking too slowly',
        suggestion: 'Pick up your pace slightly. Aim for 150-180 words per minute.',
        priority: 'low'
      });
    }
    
    // Analyze content structure
    if (words.length > 50 && !transcript.includes('first') && !transcript.includes('second') && !transcript.includes('finally')) {
      newFeedback.push({
        type: 'improvement',
        category: 'coherence',
        message: 'Consider adding structure to your response',
        suggestion: 'Use phrases like "First...", "Second...", "Finally..." to organize your thoughts.',
        priority: 'medium'
      });
    }
    
    setLiveFeedback(prev => [...prev, ...newFeedback]);
  };

  const stopSpeaking = () => {
    if (!speechRecognition.current || !speechAnalyzer.current) return;
    
    setIsRecording(false);
    
    // Stop recording
    speechRecognition.current.stopListening();
    speechAnalyzer.current.stopRecording();
    
    // Clear real-time analysis interval
    if (analysisInterval.current) {
      clearInterval(analysisInterval.current);
      analysisInterval.current = null;
    }
    
    // Calculate session duration
    if (sessionStartTime.current) {
      sessionDuration.current = (Date.now() - sessionStartTime.current.getTime()) / 1000;
    }
    
    setSessionState('analyzing');
    
    // Analyze the complete session
    setTimeout(() => {
      analyzeSession();
    }, 1000);
  };

  const analyzeSession = () => {
    if (!speechAnalyzer.current || !currentQuestion) return;
    
    try {
             const sessionAnalysis = speechAnalyzer.current.analyzeSpeech(transcript, sessionDuration.current);
      setAnalysis(sessionAnalysis);
      
      // Generate comprehensive feedback
      const comprehensiveFeedback = generateComprehensiveFeedback(sessionAnalysis, transcript);
      setFeedback(comprehensiveFeedback);
      
      // Update user progress
      updateUserProgress(sessionAnalysis);
      
      setSessionState('results');
    } catch (error) {
      setError('Failed to analyze session. Please try again.');
      setSessionState('results');
    }
  };

  const generateComprehensiveFeedback = (analysis: SpeechAnalysis, transcript: string): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];
    
    // Volume feedback
    if (analysis.volume.consistency < 70) {
      feedback.push({
        type: 'improvement',
        category: 'volume',
        message: 'Volume consistency needs improvement',
        suggestion: 'Try to maintain a steady volume throughout your speech. Practice breathing exercises.',
        priority: 'medium'
      });
    }
    
    // Clarity feedback
    if (analysis.clarity.fillerWordCount > 5) {
      feedback.push({
        type: 'critical',
        category: 'clarity',
        message: 'Too many filler words detected',
        suggestion: 'Practice pausing instead of using "um", "uh", "like". Record yourself and identify patterns.',
        priority: 'high'
      });
    }
    
    if (analysis.clarity.speechRate > 200) {
      feedback.push({
        type: 'improvement',
        category: 'clarity',
        message: 'Speaking rate is too fast',
        suggestion: 'Slow down to 150-180 words per minute. Use pauses for emphasis.',
        priority: 'medium'
      });
    }
    
    // Content feedback
    if (analysis.coherence.relevanceScore < 80) {
      feedback.push({
        type: 'improvement',
        category: 'coherence',
        message: 'Stay more focused on the question',
        suggestion: 'Keep your response directly related to the question asked. Use the STAR method: Situation, Task, Action, Result.',
        priority: 'medium'
      });
    }
    
    if (analysis.coherence.structureScore < 70) {
      feedback.push({
        type: 'improvement',
        category: 'coherence',
        message: 'Improve response structure',
        suggestion: 'Organize your thoughts with clear transitions: "First...", "Next...", "Finally...".',
        priority: 'medium'
      });
    }
    
    // Positive reinforcement
    if (analysis.overallScore > 80) {
      feedback.push({
        type: 'positive',
        category: 'general',
        message: 'Excellent speaking performance!',
        suggestion: 'Keep up the great work! Your clarity and structure are impressive.',
        priority: 'low'
      });
    }
    
    return feedback;
  };

  const updateUserProgress = (analysis: SpeechAnalysis) => {
    const newProgress: Partial<UserProgress> = {
      totalSessions: 1, // This will be incremented by the parent component
      averageScore: analysis.overallScore,
      bestScore: analysis.overallScore,
      streak: 1
    };
    
    onProgressUpdate(newProgress);
  };

  const resetSession = () => {
    setSessionState('idle');
    setCurrentQuestion(null);
    setTimeRemaining(300);
    setTranscript('');
    setAnalysis(null);
    setFeedback([]);
    setLiveFeedback([]);
    setFillerWordCount(0);
    setCurrentVolume(0);
    setSpeechRate(0);
    setError('');
  };

  const isSpeechRecognitionSupported = () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  };

  if (sessionState === 'idle') {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="w-12 h-12 text-blue-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Practice?
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Improve your public speaking skills with real-time feedback, 
            extended practice time, and comprehensive analysis.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={startNewSession}
              className="w-full bg-blue-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Start New Session (5+ minutes)
            </button>
            
            <div className="text-sm text-gray-500">
              Practice for as long as you need • Real-time feedback • Content analysis
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (sessionState === 'preparing') {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <Timer
            duration={3}
            isActive={true}
            isCountdown={true}
            onTimeUp={() => {}}
            className="mb-8"
          />
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Get Ready to Speak
          </h2>
          
          {currentQuestion && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg text-left">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl">
                  {currentQuestion.category === 'business' ? '💼' :
                   currentQuestion.category === 'personal' ? '👤' :
                   currentQuestion.category === 'academic' ? '🎓' :
                   currentQuestion.category === 'creative' ? '🎨' : '📰'}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                  {currentQuestion.category.replace('-', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentQuestion.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  currentQuestion.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {currentQuestion.question}
              </h3>
              
              {currentQuestion.context && (
                <p className="text-gray-600 mb-4 italic">
                  "{currentQuestion.context}"
                </p>
              )}
              
              {currentQuestion.tips && currentQuestion.tips.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                    Tips for Success
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {currentQuestion.tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  if (sessionState === 'speaking') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Speaking Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Display */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {currentQuestion?.question}
              </h2>
              <div className="text-sm text-gray-600">
                Speak naturally and clearly. You have {Math.floor(timeRemaining / 60)}m {timeRemaining % 60}s remaining.
              </div>
            </div>
            
            {/* Live Transcript */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mic className="w-5 h-5 mr-2 text-green-600" />
                Live Transcript
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg min-h-32">
                {transcript ? (
                  <p className="text-gray-800 leading-relaxed">{transcript}</p>
                ) : (
                  <p className="text-gray-500 italic">Start speaking to see your transcript here...</p>
                )}
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={stopSpeaking}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </button>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timer */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg">
              <Timer
                duration={timeRemaining}
                isActive={true}
                isCountdown={false}
                onTimeUp={stopSpeaking}
              />
            </div>
            
            {/* Volume Visualizer */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Volume2 className="w-5 h-5 mr-2 text-blue-600" />
                Volume Level
              </h3>
              <VolumeVisualizer volume={currentVolume} isRecording={isRecording} />
            </div>
            
            {/* Live Feedback */}
            {liveFeedback.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                  Live Feedback
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {liveFeedback.slice(-3).map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        item.type === 'positive' ? 'border-l-green-500 bg-green-50 text-green-800' :
                        item.type === 'improvement' ? 'border-l-yellow-500 bg-yellow-50 text-yellow-800' :
                        'border-l-red-500 bg-red-50 text-red-800'
                      }`}
                    >
                      <div className="text-sm font-medium">{item.message}</div>
                      {item.suggestion && (
                        <div className="text-xs mt-1 opacity-80">{item.suggestion}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (sessionState === 'analyzing') {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Analyzing Your Session
          </h2>
          
          <p className="text-gray-600">
            Processing your speech for volume, clarity, and content analysis...
          </p>
        </motion.div>
      </div>
    );
  }

  if (sessionState === 'results') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Session Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Complete!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{Math.floor(sessionDuration.current / 60)}m {Math.round(sessionDuration.current % 60)}s</div>
              <div className="text-sm text-gray-600">Speaking Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{transcript.split(/\s+/).length}</div>
              <div className="text-sm text-gray-600">Words Spoken</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{Math.round((transcript.split(/\s+/).length / (sessionDuration.current / 60)))}</div>
              <div className="text-sm text-gray-600">Words/Min</div>
            </div>
          </div>
        </motion.div>

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FeedbackPanel analysis={analysis} isVisible={true} />
          </motion.div>
        )}

        {/* Detailed Feedback */}
        {feedback.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
          >
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Detailed Feedback & Improvement Tips</h2>
            </div>
            <div className="p-6 space-y-4">
              {feedback.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    item.type === 'positive' ? 'border-l-green-500 bg-green-50 text-green-800' :
                    item.type === 'improvement' ? 'border-l-yellow-500 bg-yellow-50 text-yellow-800' :
                    'border-l-red-500 bg-red-50 text-red-800'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {item.type === 'positive' ? '✅' : item.type === 'improvement' ? '💡' : '⚠️'}
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">{item.message}</h4>
                      {item.suggestion && (
                        <p className="text-sm opacity-90">{item.suggestion}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center space-x-4"
        >
          <button
            onClick={startNewSession}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Practice Again
          </button>
          <button
            onClick={resetSession}
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Back to Start
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default SpeakingSession;
