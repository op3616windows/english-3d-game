/**
 * VoiceService manages speech recognition via Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 * with robust error handling, timeouts, and fallback verification.
 */
export class VoiceService {
  constructor() {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition || null)
      : null;

    this.SpeechRecognition = SpeechRecognition;
    this.recognition = null;
    this.isListening = false;
    this.timeoutId = null;
  }

  /**
   * Checks if browser natively supports speech recognition.
   * @returns {boolean}
   */
  isSupported() {
    return Boolean(this.SpeechRecognition);
  }

  /**
   * Starts listening for speech to match against a target English word.
   * @param {string} targetWord
   * @param {{ onStart?: () => void, onResult?: (match: boolean, transcript: string) => void, onError?: (err: string) => void, onEnd?: () => void }} callbacks
   */
  startListening(targetWord, callbacks = {}) {
    if (!this.isSupported()) {
      if (callbacks.onError) callbacks.onError('SpeechRecognition không được hỗ trợ trên trình duyệt này.');
      return;
    }

    this.stopListening();

    try {
      this.recognition = new this.SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 3;

      this.isListening = true;

      // Safe timeout (7 seconds) to prevent infinite listening hanging (N3)
      this.timeoutId = setTimeout(() => {
        if (this.isListening) {
          this.stopListening();
          if (callbacks.onError) {
            callbacks.onError('Hết thời gian chờ giọng nói (7s). Vui lòng thử lại hoặc dùng chế độ gõ chữ.');
          }
        }
      }, 7000);

      this.recognition.onstart = () => {
        if (callbacks.onStart) callbacks.onStart();
      };

      this.recognition.onresult = (event) => {
        clearTimeout(this.timeoutId);
        let matched = false;
        let bestTranscript = '';

        if (event.results && event.results.length > 0) {
          const results = event.results[0];
          for (let i = 0; i < results.length; i++) {
            const transcript = results[i].transcript.trim().toLowerCase();
            bestTranscript = bestTranscript || transcript;
            const normalizedTarget = targetWord.trim().toLowerCase();

            // Compare word or check if transcript contains the target word
            if (transcript === normalizedTarget || transcript.includes(normalizedTarget)) {
              matched = true;
              bestTranscript = transcript;
              break;
            }
          }
        }

        if (callbacks.onResult) {
          callbacks.onResult(matched, bestTranscript);
        }
      };

      this.recognition.onerror = (event) => {
        clearTimeout(this.timeoutId);
        this.isListening = false;
        const msg = event.error === 'not-allowed'
          ? 'Quyền truy cập micro bị từ chối. Hãy cho phép micro hoặc dùng bàn phím.'
          : `Lỗi nhận diện âm thanh (${event.error}). Vui lòng thử lại hoặc dùng bàn phím.`;
        if (callbacks.onError) callbacks.onError(msg);
      };

      this.recognition.onend = () => {
        clearTimeout(this.timeoutId);
        this.isListening = false;
        if (callbacks.onEnd) callbacks.onEnd();
      };

      this.recognition.start();
    } catch (e) {
      clearTimeout(this.timeoutId);
      this.isListening = false;
      if (callbacks.onError) callbacks.onError(e.message || 'Không thể khởi động microphone.');
    }
  }

  /**
   * Stops any active speech recognition session.
   */
  stopListening() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // Ignore abort errors
      }
      this.recognition = null;
    }
    this.isListening = false;
  }

  /**
   * Fallback verification helper: compares typed input with target word.
   * @param {string} input
   * @param {string} targetWord
   * @returns {boolean}
   */
  verifyFallbackText(input, targetWord) {
    if (!input || !targetWord) return false;
    const cleanInput = input.trim().toLowerCase().replace(/[.,!?;:]/g, '');
    const cleanTarget = targetWord.trim().toLowerCase().replace(/[.,!?;:]/g, '');
    return cleanInput === cleanTarget || cleanInput.includes(cleanTarget);
  }
}

/**
 * Generates celebratory Web Audio chime/fanfare without external asset files.
 * @param {'chime' | 'fanfare'} type
 */
export function playChimeSound(type = 'chime') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (type === 'chime') {
      // 2-tone pleasant success ding (E5 -> A5)
      const freqs = [659.25, 880.00];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.4);
      });
    } else {
      // Fanfare: 4 ascending celebratory chords (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.55);
      });
    }
  } catch (e) {
    // Audio context may fail if user has not interacted or browser blocks it
  }
}
