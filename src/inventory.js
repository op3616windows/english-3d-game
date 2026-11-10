/**
 * InventoryManager handles collecting vocabulary items, the 2D Inventory modal UI,
 * pronunciation playback for collected words, and empty states.
 * Preserves interface contract: constructor(container, audioService); addItem(vocab); getItems(); open(); close(); isOpen();
 */

const ITEM_ICONS = {
  book: '📖',
  apple: '🍎',
  laptop: '💻',
  table: '🪵',
  chair: '🪑'
};

export class InventoryManager {
  /**
   * @param {HTMLElement} container
   * @param {import('./audio.js').AudioService} audioService
   */
  constructor(container = null, audioService = null) {
    this.container = container || (typeof document !== 'undefined' ? (document.getElementById('ui-overlay') || document.body) : null);
    this.audioService = audioService;
    this.items = []; // Array of { id, word, ipa, meaning, example, icon, collectedAt }
    this.isOpenState = false;
    this.onOpenCallbacks = [];
    this.onCloseCallbacks = [];
    this.onChangeCallbacks = [];

    this._createDOM();
    this._attachEvents();
  }

  _createDOM() {
    if (!this.container || typeof document === 'undefined') return;
    let modal = document.getElementById('inventory-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'inventory-modal';
      modal.className = 'inventory-modal hidden';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');

      modal.innerHTML = `
        <div class="inventory-backdrop" data-action="close"></div>
        <div class="inventory-card">
          <button class="inventory-close-btn" data-action="close" aria-label="Đóng túi đồ">&times;</button>
          
          <div class="inventory-header">
            <div class="inventory-icon-badge">🎒</div>
            <div class="inventory-title-group">
              <h2 class="inventory-title">Túi đồ từ vựng</h2>
              <span class="inventory-subtitle" id="inventory-count-label">Đã thu thập: 0 từ</span>
            </div>
          </div>

          <div class="inventory-content" id="inventory-content">
            <!-- Items grid or empty state -->
          </div>

          <div class="inventory-footer">
            <span class="inventory-hint">Nhấn <kbd>I</kbd> hoặc <kbd>Esc</kbd> để đóng túi đồ</span>
          </div>
        </div>
      `;

      this.container.appendChild(modal);
    }

    // Toast element for item pickup
    let toast = document.getElementById('inventory-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'inventory-toast';
      toast.className = 'inventory-toast hidden';
      this.container.appendChild(toast);
    }

    this.modalEl = modal;
    this.contentEl = modal.querySelector('#inventory-content');
    this.countLabel = modal.querySelector('#inventory-count-label');
    this.toastEl = toast;
  }

  _attachEvents() {
    if (typeof window === 'undefined' || !this.modalEl) return;
    this.modalEl.addEventListener('click', (e) => {
      const target = e.target;
      if (target.dataset && target.dataset.action === 'close') {
        this.close();
      }
    });

    window.addEventListener('keydown', (e) => {
      // Toggle inventory on 'KeyI'
      if (e.code === 'KeyI') {
        // Only toggle if not currently typing in an input field
        if (typeof document !== 'undefined' && document.activeElement && document.activeElement.tagName === 'INPUT') return;
        if (this.isOpen()) {
          this.close();
        } else {
          this.open();
        }
      }

      // Close on Escape
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  /**
   * Adds a vocabulary item to inventory.
   * If already present, ignores to maintain idempotency.
   * @param {{ id: string, word: string, ipa?: string, meaning?: string, example?: string }} vocab
   * @returns {boolean} true if newly added, false if already in inventory
   */
  addItem(vocab) {
    if (!vocab || !vocab.word) return false;

    const exists = this.items.some(item =>
      (vocab.id && item.id === vocab.id) ||
      item.word.toLowerCase() === vocab.word.toLowerCase()
    );

    if (exists) return false;

    const wordLower = vocab.word.toLowerCase();
    const icon = ITEM_ICONS[wordLower] || '📦';

    const newItem = {
      id: vocab.id || `item_${Date.now()}`,
      word: vocab.word,
      ipa: vocab.ipa || '',
      meaning: vocab.meaning || '',
      example: vocab.example || '',
      icon: icon,
      collectedAt: new Date().toISOString()
    };

    this.items.push(newItem);
    this._render();
    this._showToast(`🎒 Đã thêm "${newItem.word}" vào Túi đồ!`);
    this._notifyChange();

    return true;
  }

  /**
   * Returns list of collected items.
   * @returns {Array<any>}
   */
  getItems() {
    return [...this.items];
  }

  _render() {
    if (!this.countLabel || !this.contentEl) return;
    this.countLabel.textContent = `Đã thu thập: ${this.items.length} từ vựng`;

    if (this.items.length === 0) {
      // Empty state (E1)
      this.contentEl.innerHTML = `
        <div class="inventory-empty-state">
          <div class="empty-icon">🎒</div>
          <h3 class="empty-title">Túi đồ đang trống</h3>
          <p class="empty-desc">
            Hãy khám phá phòng học 3D, tiếp cận các đồ vật (Cuốn sách, Quả táo, Laptop...)
            hoặc hoàn thành nhiệm vụ từ Teacher Alex để thu thập từ vựng vào túi đồ!
          </p>
        </div>
      `;
      return;
    }

    // Grid state
    let html = `<div class="inventory-grid">`;
    this.items.forEach(item => {
      html += `
        <div class="inventory-item-card" data-word="${item.word}">
          <div class="item-card-top">
            <span class="item-icon">${item.icon}</span>
            <button class="item-audio-btn" data-word="${item.word}" title="Nghe phát âm">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
            </button>
          </div>
          <div class="item-word">${item.word}</div>
          <div class="item-ipa">${item.ipa}</div>
          <div class="item-meaning">${item.meaning}</div>
        </div>
      `;
    });
    html += `</div>`;

    this.contentEl.innerHTML = html;

    // Attach click listener for card audio buttons
    const audioBtns = this.contentEl.querySelectorAll('.item-audio-btn');
    audioBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = btn.dataset.word;
        if (word && this.audioService) {
          this.audioService.speak(word);
        }
      });
    });
  }

  _showToast(msg) {
    if (!this.toastEl) return;
    this.toastEl.textContent = msg;
    this.toastEl.classList.remove('hidden');
    setTimeout(() => {
      this.toastEl.classList.add('hidden');
    }, 2500);
  }

  open() {
    this._render();
    this.modalEl.classList.remove('hidden');
    this.isOpenState = true;
    this.onOpenCallbacks.forEach(cb => cb());
  }

  close() {
    if (!this.isOpenState) return;
    this.modalEl.classList.add('hidden');
    this.isOpenState = false;
    this.onCloseCallbacks.forEach(cb => cb());
  }

  isOpen() {
    return this.isOpenState;
  }

  onOpen(cb) {
    this.onOpenCallbacks.push(cb);
  }

  onClose(cb) {
    this.onCloseCallbacks.push(cb);
  }

  onChange(cb) {
    this.onChangeCallbacks.push(cb);
  }

  _notifyChange() {
    this.onChangeCallbacks.forEach(cb => cb(this.getItems()));
  }

  serialize() {
    return [...this.items];
  }

  loadFromData(items) {
    if (Array.isArray(items)) {
      this.items = [...items];
      this._render();
      this._notifyChange();
    }
  }
}
