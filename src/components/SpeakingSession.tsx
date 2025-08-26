import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Play, Square, RotateCcw, Volume2, VolumeX, AlertCircle, Lightbulb, Crown, BookOpen, Target, Zap, TrendingUp } from 'lucide-react';
import { SpeakingQuestion, SpeechAnalysis, FeedbackItem, UserProgress } from '../types/index';
import { getRandomQuestion } from '../data/questions';
import { SpeechAnalyzer } from '../utils/speechAnalysis';
import { SpeechRecognitionManager } from '../utils/speechRecognition';
import Timer from './Timer';
import VolumeVisualizer from './VolumeVisualizer';
import FeedbackPanel from './FeedbackPanel';
import ExecutiveSpeakingGuide from './ExecutiveSpeakingGuide';

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
  const [showExecutiveGuide, setShowExecutiveGuide] = useState(false);
  
  // Real-time feedback states
  const [liveFeedback, setLiveFeedback] = useState<FeedbackItem[]>([]);
  const [fillerWordCount, setFillerWordCount] = useState<number>(0);
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(0);
  
  // Confidence and accent empowerment states
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0);
  const [accentStrength, setAccentStrength] = useState<number>(0);
  const [executivePresence, setExecutivePresence] = useState<number>(0);
  const [powerWords, setPowerWords] = useState<string[]>([]);
  
  const speechAnalyzer = useRef<SpeechAnalyzer | null>(null);
  const speechRecognition = useRef<SpeechRecognitionManager | null>(null);
  const sessionStartTime = useRef<Date | null>(null);
  const sessionDuration = useRef<number>(0);
  const analysisInterval = useRef<NodeJS.Timeout | null>(null);

  // Executive-level speaking guidance
  const executiveSpeakingTips = [
    "Your accent is your unique voice - own it with confidence!",
    "Speak from your diaphragm, not your throat - project your authentic self",
    "Pause for impact - silence is a powerful speaking tool",
    "Use your hands naturally - they're your visual punctuation",
    "Make eye contact with your audience - connect authentically",
    "Your ideas have value - deliver them with conviction",
    "Slow down to emphasize key points - speed isn't power, clarity is",
    "Breathe deeply before speaking - oxygen fuels confidence"
  ];

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
      setConfidenceLevel(0);
      setAccentStrength(0);
      setExecutivePresence(0);
      setPowerWords([]);
      
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
      
      // Calculate confidence indicators
      const newConfidence = calculateConfidenceLevel(currentAnalysis);
      setConfidenceLevel(newConfidence);
      
      // Calculate accent strength (volume + clarity)
      const newAccentStrength = (currentAnalysis.volume.consistency + currentAnalysis.clarity.articulation) / 2;
      setAccentStrength(newAccentStrength);
      
      // Calculate executive presence
      const newExecutivePresence = calculateExecutivePresence(currentAnalysis);
      setExecutivePresence(newExecutivePresence);
      
      // Detect power words
      const detectedPowerWords = detectPowerWords(transcript);
      setPowerWords(detectedPowerWords);
      
      // Generate real-time feedback
      const newFeedback = generateRealTimeFeedback(currentAnalysis, newConfidence, newAccentStrength);
      setLiveFeedback(prev => [...prev, ...newFeedback]);
      
    } catch (error) {
      console.error('Real-time analysis error:', error);
    }
  };

  const calculateConfidenceLevel = (analysis: SpeechAnalysis): number => {
    let confidence = 50; // Base confidence
    
    // Volume contributes to confidence
    if (analysis.volume.consistency > 80) confidence += 20;
    else if (analysis.volume.consistency > 60) confidence += 10;
    
    // Clarity contributes to confidence
    if (analysis.clarity.fillerWordCount < 3) confidence += 15;
    if (analysis.clarity.speechRate > 120 && analysis.clarity.speechRate < 180) confidence += 15;
    
    // Coherence contributes to confidence
    if (analysis.coherence.relevanceScore > 85) confidence += 20;
    if (analysis.coherence.structureScore > 80) confidence += 20;
    
    return Math.min(100, confidence);
  };

  const calculateExecutivePresence = (analysis: SpeechAnalysis): number => {
    let presence = 50; // Base presence
    
    // Strong volume = strong presence
    if (analysis.volume.consistency > 85) presence += 25;
    
    // Clear articulation = professional presence
    if (analysis.clarity.articulation > 80) presence += 25;
    
    // Structured thinking = executive thinking
    if (analysis.coherence.structureScore > 85) presence += 25;
    
    // Relevant content = strategic thinking
    if (analysis.coherence.relevanceScore > 90) presence += 25;
    
    return Math.min(100, presence);
  };

  const detectPowerWords = (transcript: string): string[] => {
    const powerWords = [
      'confidence', 'expertise', 'leadership', 'strategy', 'innovation',
      'excellence', 'achievement', 'success', 'vision', 'impact',
      'transformation', 'breakthrough', 'solution', 'opportunity', 'potential',
      'commitment', 'dedication', 'passion', 'drive', 'determination'
    ];
    
    const detected = powerWords.filter(word => 
      transcript.toLowerCase().includes(word.toLowerCase())
    );
    
    return detected;
  };

  const generateRealTimeFeedback = (analysis: SpeechAnalysis, confidence: number, accentStrength: number): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];
    
    // Confidence-building feedback
    if (confidence < 60) {
      feedback.push({
        type: 'improvement',
        category: 'confidence',
        message: 'Build your speaking confidence',
        suggestion: 'Take a deep breath and remember: your voice matters. Speak from your core, not your throat.',
        priority: 'high'
      });
    } else if (confidence > 80) {
      feedback.push({
        type: 'positive',
        category: 'confidence',
        message: 'Excellent confidence level!',
        suggestion: 'You\'re projecting authority and presence. Keep this energy!',
        priority: 'low'
      });
    }
    
    // Accent empowerment feedback
    if (accentStrength < 70) {
      feedback.push({
        type: 'improvement',
        category: 'accent',
        message: 'Embrace your accent with power',
        suggestion: 'Your accent is your unique signature. Project it with confidence - it adds authenticity to your message.',
        priority: 'medium'
      });
    }
    
    // Executive presence feedback
    if (analysis.volume.consistency < 75) {
      feedback.push({
        type: 'improvement',
        category: 'presence',
        message: 'Project your executive presence',
        suggestion: 'Speak from your diaphragm. Imagine filling the room with your voice - you have important things to say!',
        priority: 'high'
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
    
    // Executive-level feedback
    if (analysis.overallScore > 85) {
      feedback.push({
        type: 'positive',
        category: 'executive',
        message: 'Executive-level speaking achieved!',
        suggestion: 'You\'re demonstrating consultant-level communication skills. Your presence commands attention.',
        priority: 'low'
      });
    }
    
    // Volume feedback with accent empowerment
    if (analysis.volume.consistency < 70) {
      feedback.push({
        type: 'improvement',
        category: 'volume',
        message: 'Project your authentic voice',
        suggestion: 'Your accent is beautiful - let it be heard! Practice breathing exercises and speak from your core. Remember: soft-spoken doesn\'t mean weak - it means you have room to amplify your natural power.',
        priority: 'high'
      });
    }
    
    // Clarity feedback for executive communication
    if (analysis.clarity.fillerWordCount > 5) {
      feedback.push({
        type: 'critical',
        category: 'clarity',
        message: 'Eliminate filler words for executive impact',
        suggestion: 'Replace "um", "uh", "like" with confident pauses. Pauses show thoughtfulness and command. Practice the 2-second pause rule.',
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

  const getRandomTip = () => {
    return executiveSpeakingTips[Math.floor(Math.random() * executiveSpeakingTips.length)];
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
              🎤 Executive Speaking Practice
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Transform your speaking skills to consultant and executive level
            </p>
            
            {/* Executive Speaking Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-yellow-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Executive Speaking Tip</h3>
              </div>
              <p className="text-lg text-gray-700 italic">
                "Your accent is your unique voice - own it with confidence! Speak from your diaphragm, not your throat."
              </p>
            </div>
            
            {/* Confidence Building Section */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center mb-3">
                  <Target className="w-6 h-6 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-gray-800">Accent Empowerment</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  Your accent is your unique voice. Learn to project it with confidence and authority.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center mb-3">
                  <Zap className="w-6 h-6 text-green-600 mr-2" />
                  <h4 className="font-semibold text-gray-800">Executive Presence</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  Build the speaking presence that commands attention in boardrooms and presentations.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <div className="flex items-center mb-3">
                  <TrendingUp className="w-6 h-6 text-purple-600 mr-2" />
                  <h4 className="font-semibold text-gray-800">Strategic Communication</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  Express complex ideas with clarity and impact, regardless of accent or background.
                </p>
              </div>
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
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExecutiveGuide(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Executive Speaking Guide
            </motion.button>
          </div>
        </motion.div>
        
        {/* Executive Speaking Guide Modal */}
        {showExecutiveGuide && (
          <ExecutiveSpeakingGuide onClose={() => setShowExecutiveGuide(false)} />
        )}
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
            <p>💪 Remember: Your accent is your strength</p>
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
            🎯 Session Results - Executive Level Assessment
          </h2>
          
          {analysis && (
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Overall Score */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Overall Performance</h3>
                <div className="text-6xl font-bold text-blue-600 mb-2">{analysis.overallScore}%</div>
                <div className="text-lg text-gray-600">
                  {analysis.overallScore >= 90 ? 'Executive Master' :
                   analysis.overallScore >= 80 ? 'Consultant Level' :
                   analysis.overallScore >= 70 ? 'Emerging Leader' :
                   analysis.overallScore >= 60 ? 'Developing Speaker' : 'Building Foundation'}
                </div>
              </div>
              
              {/* Volume Score */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Voice Projection</h3>
                <div className="text-6xl font-bold text-green-600 mb-2">{analysis.volume.consistency}%</div>
                <div className="text-lg text-gray-600">
                  {analysis.volume.consistency >= 90 ? 'Commanding Presence' :
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
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExecutiveGuide(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              📚 View Executive Guide
            </motion.button>
          </div>
        </motion.div>
        
        {/* Executive Speaking Guide Modal */}
        {showExecutiveGuide && (
          <ExecutiveSpeakingGuide onClose={() => setShowExecutiveGuide(false)} />
        )}
      </div>
    );
  }

  return null;
};

export default SpeakingSession;
