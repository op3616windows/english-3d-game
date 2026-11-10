/**
 * AudioService provides text-to-speech audio pronunciation using Web Speech API (speechSynthesis).
 * Handles idempotency and prevents overlapping speech by cancelling active utterances.
 */
export class AudioService {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;
    this.voice = null;

    if (this.synth) {
      this._initVoice();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this._initVoice();
      }
    }
  }

  _initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer high quality English voices
    this.voice = voices.find(v => v.lang === 'en-US' && !v.localService) ||
                 voices.find(v => v.lang === 'en-US') ||
                 voices.find(v => v.lang.startsWith('en')) ||
                 null;
  }

  /**
   * Speaks the provided text in the target language.
   * Cancels any pending/ongoing speech first to avoid overlapping or browser hangs.
   * @param {string} text
   * @param {string} lang
   */
  speak(text, lang = 'en-US') {
    if (!this.synth || !text) {
      console.warn('SpeechSynthesis is unavailable or text is empty.');
      return;
    }

    // Cancel existing speech to guarantee idempotency and avoid audio overlap (E3, N3)
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower, clear enunciation for English learners
    utterance.pitch = 1.0;

    if (this.voice) {
      utterance.voice = this.voice;
    }

    utterance.onerror = (e) => {
      // Audio cancellation triggers 'canceled' error which is expected
      if (e.error !== 'canceled') {
        console.warn('Audio playback error:', e.error);
      }
    };

    this.synth.speak(utterance);
  }

  /**
   * Immediately stops any ongoing speech synthesis.
   */
  cancel() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}
