/**
 * StorageService manages local storage persistence for WordQuest 3D.
 * Features:
 * - Robust in-memory fallback for Incognito/Private Browsing or QuotaExceeded (E4).
 * - Safe schema validation to prevent corruption crashes (N4).
 * - Compact JSON payload storing only essential state (N2).
 */

export const STORAGE_KEY = 'wordquest_save_data_v1';

export class StorageService {
  constructor(key = STORAGE_KEY) {
    this.key = key;
    this.memoryStore = {};
    this.isLocalStorageAvailable = this._checkStorageAvailability();
  }

  _checkStorageAvailability() {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return false;
    }
    try {
      const testKey = '__wordquest_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      // Private browsing, security restriction, or quota exceeded
      return false;
    }
  }

  /**
   * Saves game state payload.
   * @param {{ level?: number, xp?: number, inventory?: Array<any>, quests?: Array<any>, badges?: Array<string>, playerPos?: { x: number, y: number, z: number } }} state
   * @returns {boolean}
   */
  save(state) {
    if (!state || typeof state !== 'object') return false;

    const payload = {
      version: 1,
      level: typeof state.level === 'number' ? state.level : 1,
      xp: typeof state.xp === 'number' ? state.xp : 0,
      inventory: Array.isArray(state.inventory) ? state.inventory : [],
      quests: Array.isArray(state.quests) ? state.quests : [],
      badges: Array.isArray(state.badges) ? state.badges : [],
      playerPos: state.playerPos && typeof state.playerPos.x === 'number'
        ? { x: state.playerPos.x, y: state.playerPos.y, z: state.playerPos.z }
        : null,
      savedAt: new Date().toISOString()
    };

    const jsonString = JSON.stringify(payload);

    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.setItem(this.key, jsonString);
        return true;
      } catch (e) {
        // Fallback to memory store if quota exceeded
        this.memoryStore[this.key] = jsonString;
        return true;
      }
    } else {
      this.memoryStore[this.key] = jsonString;
      return true;
    }
  }

  /**
   * Loads and validates stored game state.
   * @returns {{ level: number, xp: number, inventory: Array<any>, quests: Array<any>, badges: Array<string>, playerPos: { x: number, y: number, z: number } | null } | null}
   */
  load() {
    let jsonString = null;

    if (this.isLocalStorageAvailable) {
      try {
        jsonString = window.localStorage.getItem(this.key);
      } catch (e) {
        jsonString = this.memoryStore[this.key] || null;
      }
    } else {
      jsonString = this.memoryStore[this.key] || null;
    }

    if (!jsonString) return null;

    try {
      const data = JSON.parse(jsonString);

      // Schema validation (N4)
      if (!data || typeof data !== 'object') return null;

      return {
        level: typeof data.level === 'number' && data.level >= 1 ? data.level : 1,
        xp: typeof data.xp === 'number' && data.xp >= 0 ? data.xp : 0,
        inventory: Array.isArray(data.inventory) ? data.inventory : [],
        quests: Array.isArray(data.quests) ? data.quests : [],
        badges: Array.isArray(data.badges) ? data.badges : [],
        playerPos: data.playerPos && typeof data.playerPos.x === 'number' ? data.playerPos : null
      };
    } catch (e) {
      console.warn('WordQuest: Corrupted save data detected. Starting with fresh state.', e);
      return null;
    }
  }

  /**
   * Clears saved state from both LocalStorage and memory store.
   * @returns {boolean}
   */
  clear() {
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.removeItem(this.key);
      } catch (e) {
        // Ignore removal error
      }
    }
    delete this.memoryStore[this.key];
    return true;
  }
}
