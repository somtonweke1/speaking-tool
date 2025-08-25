import { SpeechAnalysis, FeedbackItem } from '../types/index';

// Common filler words to detect
const FILLER_WORDS = [
  'um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually',
  'literally', 'sort of', 'kind of', 'right', 'so', 'well', 'i mean',
  'you see', 'i guess', 'i think', 'i suppose', 'let me see'
];

export class SpeechAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private volumeHistory: number[] = [];
  private isRecording = false;

  async initialize(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.microphone.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (error) {
      console.error('Error initializing speech analyzer:', error);
      throw error;
    }
  }

  startRecording(): void {
    this.isRecording = true;
    this.volumeHistory = [];
    this.analyzeVolume();
  }

  stopRecording(): void {
    this.isRecording = false;
  }

  private analyzeVolume(): void {
    if (!this.isRecording || !this.analyser || !this.dataArray) return;

    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate average volume from frequency data
    const sum = this.dataArray.reduce((acc, val) => acc + val, 0);
    const average = sum / this.dataArray.length;
    
    this.volumeHistory.push(average);
    
    // Continue analyzing if still recording
    if (this.isRecording) {
      requestAnimationFrame(() => this.analyzeVolume());
    }
  }

  analyzeSpeech(transcript: string, duration: number): SpeechAnalysis {
    const words = transcript.toLowerCase().split(/\s+/);
    const fillerWords = this.detectFillerWords(transcript);
    const speechRate = this.calculateSpeechRate(words.length, duration);
    
    const volumeAnalysis = this.analyzeVolumeData();
    const clarityAnalysis = this.analyzeClarity(fillerWords, speechRate);
    const coherenceAnalysis = this.analyzeCoherence(transcript, words);
    
    const overallScore = this.calculateOverallScore(
      volumeAnalysis.consistency,
      clarityAnalysis.articulation,
      coherenceAnalysis.relevanceScore
    );

    return {
      volume: volumeAnalysis,
      clarity: clarityAnalysis,
      coherence: coherenceAnalysis,
      overallScore
    };
  }

  private detectFillerWords(transcript: string): string[] {
    const lowerTranscript = transcript.toLowerCase();
    const detected: string[] = [];
    
    FILLER_WORDS.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lowerTranscript.match(regex);
      if (matches) {
        detected.push(...matches);
      }
    });
    
    return detected;
  }

  private calculateSpeechRate(wordCount: number, durationSeconds: number): number {
    const durationMinutes = durationSeconds / 60;
    return Math.round(wordCount / durationMinutes);
  }

  private analyzeVolumeData() {
    if (this.volumeHistory.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        consistency: 0
      };
    }

    const average = this.volumeHistory.reduce((sum, val) => sum + val, 0) / this.volumeHistory.length;
    const min = Math.min(...this.volumeHistory);
    const max = Math.max(...this.volumeHistory);
    
    // Calculate consistency (lower variance = higher consistency)
    const variance = this.volumeHistory.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / this.volumeHistory.length;
    const consistency = Math.max(0, 100 - (variance / 100));

    return { average, min, max, consistency };
  }

  private analyzeClarity(fillerWords: string[], speechRate: number) {
    const fillerWordCount = fillerWords.length;
    
    // Calculate articulation score based on filler words and speech rate
    let articulation = 100;
    
    // Deduct points for filler words
    articulation -= fillerWordCount * 5;
    
    // Adjust for speech rate (optimal range: 120-160 WPM)
    if (speechRate < 80) articulation -= 10; // Too slow
    else if (speechRate > 200) articulation -= 15; // Too fast
    else if (speechRate >= 120 && speechRate <= 160) articulation += 5; // Optimal
    
    articulation = Math.max(0, Math.min(100, articulation));

    return {
      fillerWords,
      fillerWordCount,
      speechRate,
      articulation
    };
  }

  private analyzeCoherence(transcript: string, words: string[]) {
    // Simple coherence analysis - in a real app, this would use NLP
    let relevanceScore = 70; // Base score
    let structureScore = 70;
    let completenessScore = 70;
    
    // Check for question-answering patterns
    if (transcript.includes('because') || transcript.includes('therefore') || transcript.includes('however')) {
      structureScore += 10;
    }
    
    // Check for examples and details
    if (transcript.includes('for example') || transcript.includes('specifically') || transcript.includes('such as')) {
      completenessScore += 10;
    }
    
    // Check length (not too short, not too long)
    if (words.length >= 30 && words.length <= 200) {
      completenessScore += 10;
    } else if (words.length < 20) {
      completenessScore -= 20;
    }
    
    return {
      relevanceScore: Math.min(100, relevanceScore),
      structureScore: Math.min(100, structureScore),
      completenessScore: Math.min(100, completenessScore)
    };
  }

  private calculateOverallScore(volumeConsistency: number, articulation: number, relevance: number): number {
    // Weighted average of different components
    const weights = {
      volume: 0.25,
      clarity: 0.35,
      coherence: 0.40
    };
    
    return Math.round(
      (volumeConsistency * weights.volume) +
      (articulation * weights.clarity) +
      (relevance * weights.coherence)
    );
  }

  generateFeedback(analysis: SpeechAnalysis): FeedbackItem[] {
    const feedback: FeedbackItem[] = [];
    
    // Volume feedback
    if (analysis.volume.consistency < 60) {
      feedback.push({
        type: 'improvement',
        category: 'volume',
        message: 'Your volume varies significantly throughout your speech.',
        suggestion: 'Try to maintain consistent volume by breathing from your diaphragm and projecting your voice evenly.',
        priority: 'medium'
      });
    } else if (analysis.volume.consistency > 85) {
      feedback.push({
        type: 'positive',
        category: 'volume',
        message: 'Excellent volume consistency!',
        suggestion: 'Keep up the great work with maintaining steady volume.',
        priority: 'low'
      });
    }
    
    // Clarity feedback
    if (analysis.clarity.fillerWordCount > 5) {
      feedback.push({
        type: 'critical',
        category: 'clarity',
        message: `You used ${analysis.clarity.fillerWordCount} filler words, which can distract from your message.`,
        suggestion: 'Practice pausing instead of using filler words. Take a breath and think before speaking.',
        priority: 'high'
      });
    } else if (analysis.clarity.fillerWordCount === 0) {
      feedback.push({
        type: 'positive',
        category: 'clarity',
        message: 'No filler words detected! Your speech is clear and professional.',
        suggestion: 'Excellent clarity - this makes your message much more impactful.',
        priority: 'low'
      });
    }
    
    if (analysis.clarity.speechRate < 100) {
      feedback.push({
        type: 'improvement',
        category: 'clarity',
        message: 'Your speech rate is quite slow, which might lose your audience\'s attention.',
        suggestion: 'Try to pick up the pace slightly while maintaining clarity.',
        priority: 'medium'
      });
    } else if (analysis.clarity.speechRate > 180) {
      feedback.push({
        type: 'improvement',
        category: 'clarity',
        message: 'Your speech rate is very fast, which might make it hard for listeners to follow.',
        suggestion: 'Slow down and add more pauses to help your audience process your points.',
        priority: 'medium'
      });
    }
    
    // Coherence feedback
    if (analysis.coherence.structureScore < 70) {
      feedback.push({
        type: 'improvement',
        category: 'coherence',
        message: 'Your response could benefit from clearer structure.',
        suggestion: 'Try organizing your thoughts with clear transitions like "First," "Second," "Finally."',
        priority: 'medium'
      });
    }
    
    if (analysis.coherence.completenessScore < 60) {
      feedback.push({
        type: 'critical',
        category: 'coherence',
        message: 'Your response seems incomplete or too brief.',
        suggestion: 'Expand on your points with examples, explanations, or additional context.',
        priority: 'high'
      });
    }
    
    // Overall score feedback
    if (analysis.overallScore >= 90) {
      feedback.push({
        type: 'positive',
        category: 'general',
        message: 'Outstanding performance! You\'re demonstrating excellent public speaking skills.',
        suggestion: 'Keep practicing to maintain this high level of excellence.',
        priority: 'low'
      });
    } else if (analysis.overallScore < 60) {
      feedback.push({
        type: 'critical',
        category: 'general',
        message: 'There\'s significant room for improvement in your speaking skills.',
        suggestion: 'Focus on the specific areas mentioned above and practice regularly.',
        priority: 'high'
      });
    }
    
    return feedback;
  }

  cleanup(): void {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isRecording = false;
    this.volumeHistory = [];
  }
}
