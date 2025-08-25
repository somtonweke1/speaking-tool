export class SpeechRecognitionManager {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private transcript = '';
  private onTranscriptUpdate: ((transcript: string) => void) | null = null;
  private onFinalTranscript: ((transcript: string) => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    // Use the appropriate speech recognition API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Speech recognition started');
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update the full transcript
      this.transcript += finalTranscript;
      
      // Show interim results for real-time feedback
      const currentTranscript = this.transcript + interimTranscript;
      
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate(currentTranscript);
      }

      // If we have final results, trigger the callback
      if (finalTranscript && this.onFinalTranscript) {
        this.onFinalTranscript(this.transcript);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      
      if (this.onError) {
        this.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Speech recognition ended');
    };
  }

  startListening(): void {
    if (!this.recognition) {
      console.error('Speech recognition not initialized');
      return;
    }

    try {
      this.transcript = '';
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      if (this.onError) {
        this.onError('Failed to start speech recognition');
      }
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  reset(): void {
    this.transcript = '';
    this.stopListening();
  }

  getTranscript(): string {
    return this.transcript;
  }

  isActive(): boolean {
    return this.isListening;
  }

  // Set callbacks for real-time updates
  setTranscriptUpdateCallback(callback: (transcript: string) => void): void {
    this.onTranscriptUpdate = callback;
  }

  setFinalTranscriptCallback(callback: (transcript: string) => void): void {
    this.onFinalTranscript = callback;
  }

  setErrorCallback(callback: (error: string) => void): void {
    this.onError = callback;
  }

  // Cleanup
  destroy(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    this.isListening = false;
    this.transcript = '';
  }
}

// Utility function to check if speech recognition is supported
export const isSpeechRecognitionSupported = (): boolean => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

// Utility function to get supported languages
export const getSupportedLanguages = (): string[] => {
  return [
    'en-US', 'en-GB', 'en-AU', 'en-CA',
    'es-ES', 'es-MX', 'fr-FR', 'de-DE',
    'it-IT', 'pt-BR', 'ja-JP', 'ko-KR',
    'zh-CN', 'zh-TW', 'ru-RU', 'ar-SA'
  ];
};
