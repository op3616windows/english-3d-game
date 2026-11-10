import { playChimeSound } from './voice.js';

/**
 * DialogueManager manages the 2D interactive Dialogue Box overlay for NPC conversations.
 * Preserves interface contract: constructor(container); show(dialogueNode, onSelect); close(); isOpen();
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

/**
 * VoiceChallengeModal manages speech verification and fallback keyboard/quiz modes.
 */
export class VoiceChallengeModal {
  /**
   * @param {HTMLElement} container
   * @param {import('./voice.js').VoiceService} voiceService
   * @param {import('./audio.js').AudioService} [audioService]
   */
  constructor(container, voiceService, audioService = null) {
    this.container = container || document.getElementById('ui-overlay') || document.body;
    this.voiceService = voiceService;
    this.audioService = audioService;
    this.targetWord = '';
    this.targetIpa = '';
    this.onSuccessCallback = null;
    this.isOpenState = false;
    this.onOpenCallbacks = [];
    this.onCloseCallbacks = [];

    this._createDOM();
    this._attachEvents();
  }

  _createDOM() {
    let modal = document.getElementById('voice-challenge-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'voice-challenge-modal';
      modal.className = 'voice-modal hidden';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');

      modal.innerHTML = `
        <div class="voice-modal-backdrop" data-action="close"></div>
        <div class="voice-modal-card">
          <button class="voice-close-btn" data-action="close" aria-label="Đóng">&times;</button>
          
          <div class="voice-badge">Thử thách phát âm tiếng Anh</div>
          <h2 class="voice-title" id="voice-target-word">Target Word</h2>
          <div class="voice-ipa" id="voice-target-ipa">/ipa/</div>

          <div class="voice-controls">
            <button class="voice-listen-model-btn" id="voice-listen-model-btn" title="Nghe người bản xứ phát âm mẫu">
              🔊 Nghe mẫu
            </button>
          </div>

          <div class="voice-mic-container">
            <button class="voice-mic-btn" id="voice-mic-btn" aria-label="Bấm để nói">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
            <div class="voice-mic-waves" id="voice-mic-waves"></div>
            <div class="voice-status-text" id="voice-status-text">Bấm vào biểu tượng Micro và nói từ tiếng Anh</div>
          </div>

          <!-- Fallback Keyboard / Quiz Mode -->
          <div class="voice-fallback-section" id="voice-fallback-section">
            <div class="voice-fallback-toggle">
              <button class="voice-fallback-link" id="voice-fallback-toggle-btn">
                ⌨️ Không có micro? Nhập bằng phím hoặc chọn đáp án
              </button>
            </div>
            
            <div class="voice-fallback-box hidden" id="voice-fallback-box">
              <div class="voice-quiz-options" id="voice-quiz-options"></div>
              <div class="voice-input-row">
                <input type="text" id="voice-text-input" class="voice-input" placeholder="Nhập từ vựng..." autocomplete="off" />
                <button id="voice-submit-btn" class="voice-submit-btn">Kiểm tra</button>
              </div>
            </div>
          </div>

          <div class="voice-feedback" id="voice-feedback"></div>

          <div class="voice-footer">
            <span class="voice-hint">Nhấn <kbd>Esc</kbd> để quay lại trò chơi</span>
          </div>
        </div>
      `;

      this.container.appendChild(modal);
    }

    this.modalEl = modal;
    this.targetWordEl = modal.querySelector('#voice-target-word');
    this.targetIpaEl = modal.querySelector('#voice-target-ipa');
    this.listenModelBtn = modal.querySelector('#voice-listen-model-btn');
    this.micBtn = modal.querySelector('#voice-mic-btn');
    this.micWaves = modal.querySelector('#voice-mic-waves');
    this.statusTextEl = modal.querySelector('#voice-status-text');
    this.fallbackToggleBtn = modal.querySelector('#voice-fallback-toggle-btn');
    this.fallbackBox = modal.querySelector('#voice-fallback-box');
    this.quizOptionsEl = modal.querySelector('#voice-quiz-options');
    this.textInput = modal.querySelector('#voice-text-input');
    this.submitBtn = modal.querySelector('#voice-submit-btn');
    this.feedbackEl = modal.querySelector('#voice-feedback');
  }

  _attachEvents() {
    this.modalEl.addEventListener('click', (e) => {
      const target = e.target;
      if (target.dataset && target.dataset.action === 'close') {
        this.close();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Model pronunciation TTS
    this.listenModelBtn.addEventListener('click', () => {
      if (this.audioService && this.targetWord) {
        this.audioService.speak(this.targetWord);
      }
    });

    // Mic click
    this.micBtn.addEventListener('click', () => {
      this._handleMicClick();
    });

    // Toggle fallback
    this.fallbackToggleBtn.addEventListener('click', () => {
      const isHidden = this.fallbackBox.classList.contains('hidden');
      if (isHidden) {
        this.fallbackBox.classList.remove('hidden');
        this.textInput.focus();
      } else {
        this.fallbackBox.classList.add('hidden');
      }
    });

    // Keyboard submit
    this.submitBtn.addEventListener('click', () => {
      this._handleTextSubmit();
    });

    this.textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this._handleTextSubmit();
      }
    });
  }

  _handleMicClick() {
    if (this.voiceService.isListening) {
      this.voiceService.stopListening();
      this._setListeningUI(false);
      this.statusTextEl.textContent = 'Đã dừng nghe. Bấm micro để thử lại.';
      return;
    }

    if (!this.voiceService.isSupported()) {
      this.feedbackEl.className = 'voice-feedback error';
      this.feedbackEl.textContent = 'Trình duyệt không hỗ trợ nhận diện giọng nói. Hãy dùng chế độ gõ phím bên dưới!';
      this.fallbackBox.classList.remove('hidden');
      return;
    }

    this._setListeningUI(true);
    this.statusTextEl.textContent = `Đang lắng nghe... Hãy nói to: "${this.targetWord}"!`;
    this.feedbackEl.textContent = '';
    this.feedbackEl.className = 'voice-feedback';

    this.voiceService.startListening(this.targetWord, {
      onStart: () => {
        this._setListeningUI(true);
      },
      onResult: (matched, transcript) => {
        this._setListeningUI(false);
        if (matched) {
          this._handleSuccess(`Phát âm chính xác! Bạn đã nói: "${transcript}"`);
        } else {
          this.feedbackEl.className = 'voice-feedback warning';
          this.feedbackEl.textContent = `Bạn vừa nói "${transcript}". Hãy thử nói lại thật rõ từ "${this.targetWord}" nhé!`;
          this.statusTextEl.textContent = 'Thử lại bằng Micro hoặc nhập phím bên dưới.';
        }
      },
      onError: (err) => {
        this._setListeningUI(false);
        this.feedbackEl.className = 'voice-feedback error';
        this.feedbackEl.textContent = `${err}`;
        this.statusTextEl.textContent = 'Có thể dùng chế độ gõ bàn phím bên dưới.';
        // Auto show fallback if microphone permission blocked or error (E3)
        this.fallbackBox.classList.remove('hidden');
      },
      onEnd: () => {
        this._setListeningUI(false);
      }
    });
  }

  _handleTextSubmit() {
    const val = this.textInput.value.trim();
    if (!val) return;

    if (this.voiceService.verifyFallbackText(val, this.targetWord)) {
      this._handleSuccess(`Chính xác! Bạn đã hoàn thành từ "${this.targetWord}".`);
    } else {
      this.feedbackEl.className = 'voice-feedback error';
      this.feedbackEl.textContent = `Chưa đúng: "${val}". Gợi ý: Hãy nhập đúng từ "${this.targetWord}".`;
    }
  }

  _handleSuccess(message) {
    this.feedbackEl.className = 'voice-feedback success';
    this.feedbackEl.innerHTML = `🎉 <strong>Xuất sắc!</strong> ${message}`;
    this.statusTextEl.textContent = 'Thử thách hoàn thành thành công!';
    playChimeSound('chime');

    setTimeout(() => {
      if (this.onSuccessCallback) {
        this.onSuccessCallback(this.targetWord);
      }
      this.close();
    }, 1200);
  }

  _setListeningUI(isListening) {
    if (isListening) {
      this.micBtn.classList.add('listening');
      this.micWaves.classList.add('active');
    } else {
      this.micBtn.classList.remove('listening');
      this.micWaves.classList.remove('active');
    }
  }

  /**
   * Opens the challenge modal for a specific word.
   * @param {{ word: string, ipa?: string }} wordData
   * @param {(word: string) => void} onSuccess
   */
  open(wordData, onSuccess = null) {
    if (!wordData || !wordData.word) return;
    this.targetWord = wordData.word;
    this.targetIpa = wordData.ipa || '';
    this.onSuccessCallback = onSuccess;

    this.targetWordEl.textContent = this.targetWord;
    this.targetIpaEl.textContent = this.targetIpa;
    this.statusTextEl.textContent = `Bấm Micro và nói từ "${this.targetWord}"`;
    this.feedbackEl.textContent = '';
    this.feedbackEl.className = 'voice-feedback';
    this.textInput.value = '';
    this.fallbackBox.classList.add('hidden');
    this._setListeningUI(false);

    // Build quiz options (e.g. target word + 2 distractors)
    this._buildQuizOptions(this.targetWord);

    this.modalEl.classList.remove('hidden');
    this.isOpenState = true;
    this.onOpenCallbacks.forEach(cb => cb());
  }

  _buildQuizOptions(target) {
    const distractorsMap = {
      'Book': ['Bake', 'Boot', 'Hook'],
      'Apple': ['Apply', 'Able', 'Maple'],
      'Laptop': ['Laptop', 'Labcoat', 'Desktop'],
      'Table': ['Cable', 'Stable', 'Tablet'],
      'Chair': ['Cheer', 'Chain', 'Share']
    };

    const dist = distractorsMap[target] || ['Option A', 'Option B'];
    const options = Array.from(new Set([target, ...dist])).slice(0, 3);
    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    this.quizOptionsEl.innerHTML = '';
    options.forEach(opt => {
      const chip = document.createElement('button');
      chip.className = 'voice-quiz-chip';
      chip.textContent = opt;
      chip.addEventListener('click', () => {
        if (opt.toLowerCase() === target.toLowerCase()) {
          this._handleSuccess(`Chính xác! Bạn đã chọn từ "${target}".`);
        } else {
          this.feedbackEl.className = 'voice-feedback warning';
          this.feedbackEl.textContent = `Chưa đúng rồi, hãy chọn lại nhé!`;
        }
      });
      this.quizOptionsEl.appendChild(chip);
    });
  }

  close() {
    if (!this.isOpenState) return;
    this.voiceService.stopListening();
    this._setListeningUI(false);
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
}

/**
 * QuestCelebrationBanner displays an animated victory banner when completing a quest.
 */
export class QuestCelebrationBanner {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container || document.getElementById('ui-overlay') || document.body;
    this._createDOM();
  }

  _createDOM() {
    let el = document.getElementById('quest-celebration-banner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'quest-celebration-banner';
      el.className = 'celebration-overlay hidden';

      el.innerHTML = `
        <div class="celebration-card">
          <div class="celebration-confetti">✨ 🌟 🎉 🌟 ✨</div>
          <div class="celebration-badge-icon">🏆</div>
          <h2 class="celebration-title">QUEST COMPLETED!</h2>
          <h3 class="celebration-quest-name" id="celebration-quest-name">Quest Title</h3>
          <div class="celebration-rewards" id="celebration-rewards">
            <span class="reward-pill" id="celebration-exp">+50 EXP</span>
            <span class="reward-pill" id="celebration-badge">🎖️ Badge</span>
          </div>
          <p class="celebration-desc">You're doing fantastic! Keep up the English journey!</p>
          <button class="celebration-btn" id="celebration-dismiss-btn">Tiếp tục hành trình</button>
        </div>
      `;

      this.container.appendChild(el);
    }

    this.el = el;
    this.questNameEl = el.querySelector('#celebration-quest-name');
    this.expEl = el.querySelector('#celebration-exp');
    this.badgeEl = el.querySelector('#celebration-badge');
    this.dismissBtn = el.querySelector('#celebration-dismiss-btn');

    this.dismissBtn.addEventListener('click', () => {
      this.hide();
    });
  }

  show(questTitle, reward) {
    this.questNameEl.textContent = questTitle || 'Nhiệm vụ tiếng Anh';
    if (reward) {
      this.expEl.textContent = `+${reward.exp || 50} EXP`;
      this.badgeEl.textContent = `🎖️ ${reward.badge || 'Huy hiệu'}`;
    }

    this.el.classList.remove('hidden');
    playChimeSound('fanfare');

    // Auto dismiss after 6s if not clicked
    setTimeout(() => {
      this.hide();
    }, 6000);
  }

  hide() {
    this.el.classList.add('hidden');
  }
}

/**
 * QuestTrackerHUD renders the persistent quest tracker HUD in the top right.
 */
export class QuestTrackerHUD {
  /**
   * @param {HTMLElement} container
   * @param {import('./quest.js').QuestEngine} questEngine
   */
  constructor(container, questEngine) {
    this.container = container || document.getElementById('ui-overlay') || document.body;
    this.questEngine = questEngine;
    this._createDOM();

    this.questEngine.onQuestChange(state => this.update(state));
  }

  _createDOM() {
    let hud = document.getElementById('quest-tracker-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'quest-tracker-hud';
      hud.className = 'quest-tracker-hud';

      hud.innerHTML = `
        <div class="hud-quest-header">
          <span class="hud-quest-icon">📜</span>
          <span class="hud-quest-label">Nhiệm vụ hiện tại</span>
        </div>
        <div class="hud-quest-body" id="hud-quest-body">
          <div class="hud-quest-title" id="hud-quest-title">Gặp Teacher Alex để nhận nhiệm vụ</div>
          <div class="hud-quest-objective" id="hud-quest-objective">Di chuyển lại gần Teacher Alex và nhấn E</div>
        </div>
        <div class="hud-stats-bar" id="hud-stats-bar">
          <span class="hud-stat-pill" id="hud-stat-exp">⭐ 0 EXP</span>
          <span class="hud-stat-pill" id="hud-stat-badges">🎖️ 0 Huy hiệu</span>
        </div>
      `;

      this.container.appendChild(hud);
    }

    this.hudEl = hud;
    this.titleEl = hud.querySelector('#hud-quest-title');
    this.objectiveEl = hud.querySelector('#hud-quest-objective');
    this.expEl = hud.querySelector('#hud-stat-exp');
    this.badgesEl = hud.querySelector('#hud-stat-badges');
  }

  update(state) {
    const { currentQuest, availableQuest, exp, badges, allCompleted } = state;

    this.expEl.textContent = `⭐ ${exp} EXP`;
    this.badgesEl.textContent = `🎖️ ${badges.length} Huy hiệu`;

    if (allCompleted) {
      this.titleEl.textContent = '🏆 Tất cả nhiệm vụ hoàn thành!';
      this.objectiveEl.innerHTML = '<span class="status-done">Bạn là bậc thầy từ vựng tiếng Anh!</span>';
      return;
    }

    if (currentQuest) {
      this.titleEl.textContent = currentQuest.title;
      if (currentQuest.status === 'active') {
        this.objectiveEl.innerHTML = `🔍 Tìm <strong>${currentQuest.targetObject}</strong> & phát âm "<strong>${currentQuest.targetWord}</strong>"`;
      } else if (currentQuest.status === 'completed') {
        this.objectiveEl.innerHTML = `🎉 <span class="status-ready">Đã xong phát âm! Quay lại báo cáo Teacher Alex.</span>`;
      }
    } else if (availableQuest) {
      this.titleEl.textContent = 'Nhiệm vụ mới sẵn sàng!';
      this.objectiveEl.textContent = `Gặp Teacher Alex để nhận: "${availableQuest.title}"`;
    } else {
      this.titleEl.textContent = 'Khám phá tự do';
      this.objectiveEl.textContent = 'Gặp Teacher Alex để tiếp tục học.';
    }
  }
}
