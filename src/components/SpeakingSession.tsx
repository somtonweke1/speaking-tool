import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Play, Square, RotateCcw, Volume2, VolumeX, AlertCircle, Lightbulb, Crown, BookOpen, Target, Zap, TrendingUp } from 'lucide-react';
import { SpeakingQuestion, SpeechAnalysis, FeedbackItem, UserProgress } from '../types/index';
import { getRandomQuestion } from '../data/questions';
import { SpeechAnalyzer } from '../utils/speechAnalysis';
import { SpeechRecognitionManager } from '../utils/speechRecognition';
import { SupabaseProgress, SupabaseSessions } from '../config/api';
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
    
    // Start volume analysis
    speechAnalyzer.current.startRecording();
    
    // Start real-time analysis
    analysisInterval.current = setInterval(() => {
      analyzeRealTime();
    }, 2000); // Analyze every 2 seconds
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

  const analyzeRealTime = () => {
    if (!speechAnalyzer.current || !transcript) return;
    
    try {
      // Analyze current speech patterns
      const currentAnalysis = speechAnalyzer.current.analyzeSpeech(transcript, sessionDuration.current);
      
      // Update real-time metrics
      setCurrentVolume(currentAnalysis.volume.consistency);
      setSpeechRate(currentAnalysis.clarity.speechRate);
      setFillerWordCount(currentAnalysis.clarity.fillerWordCount);
      
      // Generate real-time feedback
      const newFeedback = generateRealTimeFeedback(currentAnalysis);
      setLiveFeedback(prev => [...prev, ...newFeedback]);
      
    } catch (error) {
      console.error('Real-time analysis error:', error);
    }
  };

  const generateRealTimeFeedback = (analysis: SpeechAnalysis): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];
    
    // Volume feedback
    if (analysis.volume.consistency < 75) {
      feedback.push({
        type: 'improvement',
        category: 'volume',
        message: 'Project your voice better',
        suggestion: 'Speak from your diaphragm. Practice breathing exercises to improve volume control.',
        priority: 'high'
      });
    }
    
    // Clarity feedback
    if (analysis.clarity.fillerWordCount > 5) {
      feedback.push({
        type: 'improvement',
        category: 'clarity',
        message: 'Reduce filler words',
        suggestion: 'Replace "um", "uh", "like" with confident pauses. Pauses show thoughtfulness.',
        priority: 'medium'
      });
    }
    
    return feedback;
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
    
    // High score feedback
    if (analysis.overallScore > 85) {
      feedback.push({
        type: 'positive',
        category: 'general',
        message: 'Excellent speaking performance!',
        suggestion: 'You\'re demonstrating strong communication skills. Keep practicing to maintain this level.',
        priority: 'low'
      });
    }
    
    // Volume feedback
    if (analysis.volume.consistency < 70) {
      feedback.push({
        type: 'improvement',
        category: 'volume',
        message: 'Improve voice projection',
        suggestion: 'Practice breathing exercises and speak from your diaphragm. Focus on maintaining consistent volume.',
        priority: 'high'
      });
    }
    
    // Clarity feedback
    if (analysis.clarity.fillerWordCount > 5) {
      feedback.push({
        type: 'improvement',
        category: 'clarity',
        message: 'Reduce filler words',
        suggestion: 'Replace "um", "uh", "like" with confident pauses. Pauses show thoughtfulness.',
        priority: 'high'
      });
    }
    
    if (analysis.clarity.speechRate > 200) {
      feedback.push({
        type: 'improvement',
        category: 'clarity',
        message: 'Pace yourself for maximum impact',
        suggestion: 'Slow down to 150-180 words per minute. Executive speakers use pace strategically. Fast = nervous, slow = confident.',
        priority: 'medium'
      });
    }
    
    // Content feedback for strategic thinking
    if (analysis.coherence.relevanceScore < 80) {
      feedback.push({
        type: 'improvement',
        category: 'coherence',
        message: 'Focus your strategic thinking',
        suggestion: 'Use the Executive STAR method: Strategic context, Target outcome, Action plan, Results focus. Stay laser-focused on the question.',
        priority: 'medium'
      });
    }
    
    if (analysis.coherence.structureScore < 70) {
      feedback.push({
        type: 'improvement',
        category: 'coherence',
        message: 'Structure like an executive',
        suggestion: 'Organize with executive precision: "Here\'s the situation...", "Here\'s my recommendation...", "Here\'s the expected outcome...".',
        priority: 'medium'
      });
    }
    
    // Accent empowerment feedback
    feedback.push({
      type: 'positive',
      category: 'accent',
      message: 'Your accent is your competitive advantage',
      suggestion: 'International executives value diverse perspectives. Your accent shows global experience and cultural intelligence. Own it with pride!',
      priority: 'low'
    });
    
    return feedback;
  };

  const updateUserProgress = (analysis: SpeechAnalysis) => {
    const newProgress: Partial<UserProgress> = {
      totalSessions: 1,
      averageScore: analysis.overallScore,
      bestScore: analysis.overallScore,
      streak: 1
    };
    
    onProgressUpdate(newProgress);
  };

  const isSpeechRecognitionSupported = () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  };



  if (sessionState === 'idle') {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🎤 Speaking Practice
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Improve your public speaking skills with real-time feedback
            </p>
            
            {/* Speaking Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <Lightbulb className="w-8 h-8 text-yellow-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Speaking Tip</h3>
              </div>
              <p className="text-lg text-gray-700 italic">
                "Take a deep breath, speak clearly, and remember that practice makes perfect!"
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startNewSession}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              🚀 Start Executive Practice Session
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (sessionState === 'preparing') {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎯 Preparing Your Executive Session
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Get ready to showcase your leadership communication skills
          </p>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Your Speaking Challenge:</h3>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-lg text-gray-700 mb-4">{currentQuestion?.question}</p>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Category:</span> {currentQuestion?.category} | 
                <span className="font-medium"> Difficulty:</span> {currentQuestion?.difficulty}
              </div>
            </div>
          </div>
          
          <div className="text-2xl font-bold text-blue-600 mb-4">
            Session starts in 3 seconds...
          </div>
          
          <div className="text-gray-600">
            <p>🎤 Take a deep breath</p>
            <p>💪 Remember: Practice makes perfect</p>
            <p>🚀 Project confidence from your core</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (sessionState === 'speaking') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Speaking Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Current Question</h3>
                <Timer 
                  duration={timeRemaining}
                  isActive={isRecording}
                  isCountdown={false}
                  onTimeUp={stopSpeaking}
                />
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <p className="text-lg text-gray-700 font-medium">{currentQuestion?.question}</p>
              </div>
              
              {/* Recording Controls */}
              <div className="flex justify-center space-x-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopSpeaking}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:bg-red-700 transition-colors"
                >
                  <Square className="w-5 h-5" />
                  <span>Stop Recording</span>
                </motion.button>
              </div>
              
              {/* Live Transcript */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Live Transcript</h4>
                <div className="min-h-[100px] text-gray-600">
                  {transcript || "Start speaking to see your transcript here..."}
                </div>
              </div>
            </div>
            
            {/* Volume Visualization */}
            <VolumeVisualizer volume={currentVolume} isRecording={isRecording} />
          </div>
          
          {/* Real-time Feedback Panel */}
          <div className="space-y-6">
            {/* Live Feedback */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Feedback</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {liveFeedback.length > 0 ? (
                  liveFeedback.map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        item.type === 'positive' ? 'bg-green-50 text-green-800' :
                        item.type === 'improvement' ? 'bg-blue-50 text-blue-800' :
                        'bg-red-50 text-red-800'
                      }`}
                    >
                      <div className="font-medium">{item.message}</div>
                      <div className="text-xs mt-1 opacity-80">{item.suggestion}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">Start speaking to receive live feedback...</p>
                )}
              </div>
            </div>
            
            {/* Executive Speaking Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Crown className="w-5 h-5 text-yellow-600 mr-2" />
                Executive Speaking Tips
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>💪 <strong>Project from your core:</strong> Speak from your diaphragm, not your throat</p>
                <p>🎯 <strong>Use strategic pauses:</strong> Silence is a powerful speaking tool</p>
                <p>🌍 <strong>Own your accent:</strong> It shows global perspective and cultural intelligence</p>
                <p>⚡ <strong>Focus on clarity:</strong> Clear communication &gt; perfect pronunciation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sessionState === 'analyzing') {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🔍 Analyzing Your Executive Performance
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Evaluating your speaking skills for consultant and executive level
          </p>
          
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">
              Analyzing your speech patterns, confidence indicators, and executive presence...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (sessionState === 'results') {
    return (
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            🎯 Session Results - Speaking Assessment
          </h2>
          
          {analysis && (
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Overall Score */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Overall Performance</h3>
                <div className="text-6xl font-bold text-blue-600 mb-2">{analysis.overallScore}%</div>
                <div className="text-lg text-gray-600">
                  {analysis.overallScore >= 90 ? 'Speaking Master' :
                   analysis.overallScore >= 80 ? 'Advanced Speaker' :
                   analysis.overallScore >= 70 ? 'Good Speaker' :
                   analysis.overallScore >= 60 ? 'Developing Speaker' : 'Building Foundation'}
                </div>
              </div>
              
              {/* Volume Score */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Voice Projection</h3>
                <div className="text-6xl font-bold text-green-600 mb-2">{analysis.volume.consistency}%</div>
                <div className="text-lg text-gray-600">
                  {analysis.volume.consistency >= 90 ? 'Excellent Volume' :
                   analysis.volume.consistency >= 80 ? 'Strong Projection' :
                   analysis.volume.consistency >= 70 ? 'Good Volume' :
                   analysis.volume.consistency >= 60 ? 'Developing Projection' : 'Building Foundation'}
                </div>
              </div>
              
              {/* Clarity Score */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Communication Clarity</h3>
                <div className="text-6xl font-bold text-yellow-600 mb-2">{analysis.clarity.articulation}%</div>
                <div className="text-lg text-gray-600">
                  {analysis.clarity.articulation >= 90 ? 'Crystal Clear' :
                   analysis.clarity.articulation >= 80 ? 'Very Clear' :
                   analysis.clarity.articulation >= 70 ? 'Clear' :
                   analysis.clarity.articulation >= 60 ? 'Developing Clarity' : 'Building Foundation'}
                </div>
              </div>
            </div>
          )}
          
          {/* Feedback Panel */}
          <FeedbackPanel analysis={analysis} isVisible={true} />
          
          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startNewSession}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              🚀 Practice Another Session
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default SpeakingSession;
