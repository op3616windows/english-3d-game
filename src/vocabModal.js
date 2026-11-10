/**
 * VocabModal handles rendering and interaction for the 2D bilingual vocabulary card overlay.
 */
export class VocabModal {
  /**
   * @param {HTMLElement} container
   * @param {import('./audio.js').AudioService} audioService
   */
  constructor(container, audioService) {
    this.container = container || document.getElementById('ui-overlay') || document.body;
    this.audioService = audioService;
    this.currentVocab = null;
    this.onOpenCallbacks = [];
    this.onCloseCallbacks = [];

    this._createModalElements();
    this._attachEvents();
  }

  _createModalElements() {
    let modal = document.getElementById('vocab-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'vocab-modal';
      modal.className = 'vocab-modal hidden';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');

      modal.innerHTML = `
        <div class="vocab-modal-backdrop" data-action="close"></div>
        <div class="vocab-modal-card">
          <button class="modal-close-btn" data-action="close" aria-label="Đóng">&times;</button>
          <div class="modal-badge">Từ vựng tiếng Anh</div>
          
          <div class="modal-word-header">
            <h2 class="modal-word" id="modal-word-text">Word</h2>
            <button class="modal-audio-btn" id="modal-audio-btn" aria-label="Nghe phát âm" title="Nghe phát âm chuẩn">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
          </div>

          <div class="modal-ipa" id="modal-ipa-text">/wɜːd/</div>

          <div class="modal-section">
            <span class="modal-label">Nghĩa tiếng Việt:</span>
            <div class="modal-meaning" id="modal-meaning-text">Giải nghĩa chi tiết</div>
          </div>

          <div class="modal-section">
            <span class="modal-label">Ví dụ ngữ cảnh:</span>
            <div class="modal-example" id="modal-example-text">"Example sentence."</div>
          </div>

          <div class="modal-footer">
            <span class="modal-hint">Nhấn <kbd>Esc</kbd> hoặc bấm ra ngoài để đóng thẻ</span>
          </div>
        </div>
      `;

      this.container.appendChild(modal);
    }

    this.modalEl = modal;
    this.wordEl = modal.querySelector('#modal-word-text');
    this.ipaEl = modal.querySelector('#modal-ipa-text');
    this.meaningEl = modal.querySelector('#modal-meaning-text');
    this.exampleEl = modal.querySelector('#modal-example-text');
    this.audioBtn = modal.querySelector('#modal-audio-btn');
  }

  _attachEvents() {
    // Close button & backdrop click
    this.modalEl.addEventListener('click', (e) => {
      const target = e.target;
      if (target.dataset && target.dataset.action === 'close') {
        this.close();
      }
    });

    // Pronounce audio button
    this.audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.currentVocab && this.audioService) {
        this.audioService.speak(this.currentVocab.word);
        this._animateAudioButton();
      }
    });

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  _animateAudioButton() {
    this.audioBtn.classList.add('playing');
    setTimeout(() => {
      this.audioBtn.classList.remove('playing');
    }, 600);
  }

  /**
   * Opens the modal with vocabulary data.
   * @param {{ id: string, word: string, ipa: string, meaning: string, example: string }} vocabData
   */
  open(vocabData) {
    if (!vocabData) return;
    this.currentVocab = vocabData;

    this.wordEl.textContent = vocabData.word;
    this.ipaEl.textContent = vocabData.ipa;
    this.meaningEl.textContent = vocabData.meaning;
    this.exampleEl.textContent = `"${vocabData.example}"`;

    this.modalEl.classList.remove('hidden');

    // Automatically pronounce once when opened to assist learning
    if (this.audioService) {
      this.audioService.speak(vocabData.word);
    }

    this.onOpenCallbacks.forEach(cb => cb(vocabData));
  }

  /**
   * Closes the vocabulary modal.
   */
  close() {
    if (!this.isOpen()) return;
    this.modalEl.classList.add('hidden');
    this.currentVocab = null;

    if (this.audioService) {
      this.audioService.cancel();
    }

    this.onCloseCallbacks.forEach(cb => cb());
  }

  /**
   * Checks if the modal is currently open.
   * @returns {boolean}
   */
  isOpen() {
    return !this.modalEl.classList.contains('hidden');
  }

  onOpen(callback) {
    this.onOpenCallbacks.push(callback);
  }

  onClose(callback) {
    this.onCloseCallbacks.push(callback);
  }
}
