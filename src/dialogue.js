/**
 * DialogueManager manages the 2D interactive Dialogue Box overlay for NPC conversations.
 */
export class DialogueManager {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container || document.getElementById('ui-overlay') || document.body;
    this.currentNode = null;
    this.onSelectCallback = null;
    this.onOpenCallbacks = [];
    this.onCloseCallbacks = [];

    this._createDOM();
    this._attachEvents();
  }

  _createDOM() {
    let box = document.getElementById('dialogue-box');
    if (!box) {
      box = document.createElement('div');
      box.id = 'dialogue-box';
      box.className = 'dialogue-box hidden';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');

      box.innerHTML = `
        <div class="dialogue-card">
          <button class="dialogue-close-btn" data-action="close" aria-label="Đóng hội thoại">&times;</button>
          <div class="dialogue-header">
            <div class="dialogue-avatar">🎓</div>
            <div class="dialogue-speaker-info">
              <h3 class="dialogue-speaker-name" id="dialogue-speaker-name">Teacher Alex</h3>
              <span class="dialogue-speaker-title">English Guide & Mentor</span>
            </div>
          </div>
          <div class="dialogue-content" id="dialogue-text">
            Hello! Welcome to WordQuest.
          </div>
          <div class="dialogue-options" id="dialogue-options"></div>
          <div class="dialogue-footer">
            <span class="dialogue-hint">Nhấn <kbd>Esc</kbd> để rời hội thoại</span>
          </div>
        </div>
      `;

      this.container.appendChild(box);
    }

    this.boxEl = box;
    this.speakerEl = box.querySelector('#dialogue-speaker-name');
    this.textEl = box.querySelector('#dialogue-text');
    this.optionsEl = box.querySelector('#dialogue-options');
  }

  _attachEvents() {
    this.boxEl.addEventListener('click', (e) => {
      if (e.target && e.target.dataset && e.target.dataset.action === 'close') {
        this.close();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  /**
   * Shows a dialogue node with speech text and choice options.
   * @param {{ text: string, speaker?: string, options?: Array<{ label: string, action: string, value?: any }> }} dialogueNode
   * @param {(choice: { label: string, action: string, value?: any }) => void} onSelect
   */
  show(dialogueNode, onSelect = null) {
    if (!dialogueNode) return;
    this.currentNode = dialogueNode;
    this.onSelectCallback = onSelect;

    if (dialogueNode.speaker) {
      this.speakerEl.textContent = dialogueNode.speaker;
    }
    this.textEl.textContent = dialogueNode.text;

    // Render option buttons
    this.optionsEl.innerHTML = '';
    const options = dialogueNode.options || [{ label: 'Tiếp tục', action: 'close' }];

    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'dialogue-option-btn';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        if (this.onSelectCallback) {
          this.onSelectCallback(opt);
        } else {
          this.close();
        }
      });
      this.optionsEl.appendChild(btn);
    });

    this.boxEl.classList.remove('hidden');
    this.onOpenCallbacks.forEach(cb => cb(dialogueNode));
  }

  /**
   * Closes the dialogue box.
   */
  close() {
    if (!this.isOpen()) return;
    this.boxEl.classList.add('hidden');
    this.currentNode = null;
    this.onSelectCallback = null;
    this.onCloseCallbacks.forEach(cb => cb());
  }

  isOpen() {
    return !this.boxEl.classList.contains('hidden');
  }

  onOpen(callback) {
    this.onOpenCallbacks.push(callback);
  }

  onClose(callback) {
    this.onCloseCallbacks.push(callback);
  }
}
