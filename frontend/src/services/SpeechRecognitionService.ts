// Define types for the Speech Recognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Define the SpeechRecognition class with browser prefixes
const SpeechRecognition = typeof window !== 'undefined' ? 
  (window as any).SpeechRecognition || 
  (window as any).webkitSpeechRecognition || 
  (window as any).mozSpeechRecognition || 
  (window as any).msSpeechRecognition : 
  null;

// Event callbacks
export interface SpeechRecognitionCallbacks {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

class SpeechRecognitionService {
  private recognition: any;
  private isListening: boolean = false;
  private callbacks: SpeechRecognitionCallbacks = {};
  private finalTranscript: string = '';
  private interimTranscript: string = '';

  constructor() {
    if (!SpeechRecognition) {
      console.error('Speech Recognition API is not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.configureRecognition();
  }

  /**
   * Configure the speech recognition instance
   */
  private configureRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    this.recognition.lang = 'en-US';

    // Set up event listeners
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.finalTranscript += event.results[i][0].transcript;
        } else {
          this.interimTranscript += event.results[i][0].transcript;
        }
      }
      
      // Call the result callback if defined
      if (this.callbacks.onResult) {
        if (event.results[event.resultIndex].isFinal) {
          this.callbacks.onResult(this.finalTranscript, true);
        } else {
          this.callbacks.onResult(this.interimTranscript, false);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      if (this.callbacks.onError) {
        this.callbacks.onError(event.error);
      }
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.callbacks.onStart) {
        this.callbacks.onStart();
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // Auto restart if we're still supposed to be listening
        this.recognition.start();
      } else if (this.callbacks.onEnd) {
        this.callbacks.onEnd();
      }
    };
  }

  /**
   * Check if speech recognition is supported in this browser
   */
  public isSupported(): boolean {
    return !!SpeechRecognition;
  }

  /**
   * Set callback functions for speech recognition events
   */
  public setCallbacks(callbacks: SpeechRecognitionCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Start listening for speech
   */
  public startListening(): void {
    if (!this.recognition) return;
    
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.isListening = true;
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  }

  /**
   * Stop listening for speech
   */
  public stopListening(): void {
    if (!this.recognition) return;
    
    this.isListening = false;
    
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }

  /**
   * Reset the transcripts
   */
  public resetTranscript(): void {
    this.finalTranscript = '';
    this.interimTranscript = '';
  }

  /**
   * Get the current transcript
   */
  public getTranscript(): string {
    return this.finalTranscript;
  }
}

export default new SpeechRecognitionService(); 