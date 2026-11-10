import { playChimeSound } from './voice.js';

/**
 * ProgressionManager manages player XP, level progression formulas, and level up notifications.
 * Preserves interface contract: constructor(); addXP(amount); getLevel(); getXP(); getNextLevelXP();
 */
export class ProgressionManager {
  /**
   * @param {HTMLElement} [container]
   */
  constructor(container = null) {
    this.container = container || (typeof document !== 'undefined' ? (document.getElementById('ui-overlay') || document.body) : null);
    this.level = 1;
    this.xp = 0;
    this.xpListeners = [];
    this.levelUpListeners = [];

    this._createDOM();
  }

  _createDOM() {
    if (!this.container || typeof document === 'undefined') return;
    let el = document.getElementById('level-up-banner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'level-up-banner';
      el.className = 'level-up-overlay hidden';

      el.innerHTML = `
        <div class="level-up-card">
          <div class="level-up-sparkles">⭐ ⭐ ⭐</div>
          <h2 class="level-up-title">LEVEL UP!</h2>
          <div class="level-up-badge" id="level-up-badge">LEVEL 2</div>
          <p class="level-up-desc">Chúc mừng bạn đã thăng cấp! Vốn từ vựng tiếng Anh của bạn đang ngày càng mở rộng!</p>
          <button class="level-up-btn" id="level-up-dismiss-btn">Tuyệt vời!</button>
        </div>
      `;

      this.container.appendChild(el);
    }

    this.bannerEl = el;
    this.badgeEl = el.querySelector('#level-up-badge');
    this.dismissBtn = el.querySelector('#level-up-dismiss-btn');

    this.dismissBtn.addEventListener('click', () => {
      this.hideNotification();
    });
  }

  /**
   * Calculates XP required to advance from a given level to the next.
   * Level 1 -> 100 XP, Level 2 -> 150 XP, Level 3 -> 200 XP, etc.
   * @param {number} level
   * @returns {number}
   */
  getXPForLevel(level) {
    return 100 + (level - 1) * 50;
  }

  /**
   * Returns XP required to reach the next level from current level.
   * @returns {number}
   */
  getNextLevelXP() {
    return this.getXPForLevel(this.level);
  }

  /**
   * Returns current player level.
   * @returns {number}
   */
  getLevel() {
    return this.level;
  }

  /**
   * Returns current XP accumulated within current level.
   * @returns {number}
   */
  getXP() {
    return this.xp;
  }

  /**
   * Returns progress fraction (0 to 1) for XP progress bar.
   * @returns {number}
   */
  getProgressRatio() {
    const nextXP = this.getNextLevelXP();
    return Math.min(Math.max(this.xp / nextXP, 0), 1);
  }

  /**
   * Adds XP, calculates level-ups, and notifies listeners.
   * @param {number} amount
   * @returns {{ leveledUp: boolean, newLevel: number, currentXP: number }}
   */
  addXP(amount) {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return { leveledUp: false, newLevel: this.level, currentXP: this.xp };
    }

    this.xp += amount;
    let leveledUp = false;

    while (this.xp >= this.getNextLevelXP()) {
      this.xp -= this.getNextLevelXP();
      this.level += 1;
      leveledUp = true;
      this._notifyLevelUp(this.level);
    }

    this._notifyXPChange();

    if (leveledUp) {
      this.showNotification(this.level);
    }

    return { leveledUp, newLevel: this.level, currentXP: this.xp };
  }

  showNotification(level) {
    if (!this.bannerEl) return;
    this.badgeEl.textContent = `LEVEL ${level}`;
    this.bannerEl.classList.remove('hidden');
    playChimeSound('fanfare');

    setTimeout(() => {
      this.hideNotification();
    }, 4500);
  }

  hideNotification() {
    if (this.bannerEl) {
      this.bannerEl.classList.add('hidden');
    }
  }

  onXPChange(cb) {
    this.xpListeners.push(cb);
    cb({ xp: this.xp, nextXP: this.getNextLevelXP(), level: this.level, ratio: this.getProgressRatio() });
  }

  onLevelUp(cb) {
    this.levelUpListeners.push(cb);
  }

  _notifyXPChange() {
    const data = { xp: this.xp, nextXP: this.getNextLevelXP(), level: this.level, ratio: this.getProgressRatio() };
    this.xpListeners.forEach(fn => fn(data));
  }

  _notifyLevelUp(newLevel) {
    this.levelUpListeners.forEach(fn => fn(newLevel));
  }

  /**
   * Serializes state for LocalStorage persistence.
   */
  serialize() {
    return {
      level: this.level,
      xp: this.xp
    };
  }

  /**
   * Restores state from LocalStorage data.
   */
  loadFromData(data) {
    if (!data) return;
    if (typeof data.level === 'number' && data.level >= 1) {
      this.level = data.level;
    }
    if (typeof data.xp === 'number' && data.xp >= 0) {
      this.xp = data.xp;
    }
    this._notifyXPChange();
  }
}
