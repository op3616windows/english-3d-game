/**
 * QuestEngine manages English learning quests, quest lifecycles, objectives, and rewards.
 * Lifecycles:
 * - 'available': Quest is ready to be offered to the player.
 * - 'active': Player has accepted the quest and is working on the objective.
 * - 'completed': Player has pronounced or typed the target word correctly.
 * - 'rewarded': Player has turned in the quest to the NPC and received rewards.
 */

export const DEFAULT_QUESTS = [
  {
    id: 'quest_book',
    title: 'Find the Ancient Book',
    targetObject: 'Book',
    targetWord: 'Book',
    ipa: '/bʊk/',
    description: 'Find the blue Book on the desk and practice pronouncing "Book".',
    npcOffer: "Welcome to WordQuest! Can you find the blue Book on the desk and practice saying its name?",
    npcReminder: "Have you found the Book yet? It's resting on the study desk. Go inspect it and practice saying 'Book'!",
    npcReward: "Excellent work! You found the Book and pronounced it accurately. Here is your reward!",
    reward: { exp: 50, badge: 'Bookworm' }
  },
  {
    id: 'quest_apple',
    title: 'A Fresh Apple',
    targetObject: 'Apple',
    targetWord: 'Apple',
    ipa: '/ˈæp.əl/',
    description: 'Locate the fresh red Apple on the teacher\'s table and pronounce "Apple".',
    npcOffer: "Great job on the first lesson! Now, can you find the red Apple on the table and pronounce 'Apple' clearly?",
    npcReminder: "Look closely on the front table for the red Apple! Go inspect it and practice saying 'Apple'!",
    npcReward: "Splendid! You have mastered the word 'Apple'! Here is your well-deserved reward!",
    reward: { exp: 60, badge: 'Fruit Explorer' }
  },
  {
    id: 'quest_laptop',
    title: 'High-Tech Laptop',
    targetObject: 'Laptop',
    targetWord: 'Laptop',
    ipa: '/ˈlæp.tɒp/',
    description: 'Find the modern Laptop and practice pronouncing "Laptop".',
    npcOffer: "Ready for technology? Locate the modern Laptop and say 'Laptop' into the microphone!",
    npcReminder: "The silver Laptop is placed on one of the work tables. Go check it out and say 'Laptop'!",
    npcReward: "Brilliant! You can now pronounce 'Laptop' like a native speaker! Here is your reward!",
    reward: { exp: 70, badge: 'Tech Wizard' }
  }
];

export class QuestEngine {
  constructor(quests = DEFAULT_QUESTS) {
    this.quests = quests.map(q => ({
      ...q,
      status: 'available' // 'available' | 'active' | 'completed' | 'rewarded'
    }));

    this.exp = 0;
    this.badges = [];
    this.isProcessingTurnIn = false; // Debounce guard against double clicks (E4)
    this.listeners = [];
  }

  /**
   * Registers a listener for quest changes.
   * @param {(state: { currentQuest: any, availableQuest: any, exp: number, badges: string[] }) => void} listener
   */
  onQuestChange(listener) {
    this.listeners.push(listener);
    this._emit();
  }

  _emit() {
    const state = {
      currentQuest: this.getCurrentQuest(),
      availableQuest: this.getAvailableQuest(),
      exp: this.exp,
      badges: [...this.badges],
      allCompleted: this.isAllCompleted()
    };
    this.listeners.forEach(fn => fn(state));
  }

  /**
   * Returns the current active or completed (not yet turned in) quest.
   * @returns {any | null}
   */
  getCurrentQuest() {
    return this.quests.find(q => q.status === 'active' || q.status === 'completed') || null;
  }

  /**
   * Returns the next available quest if player has no active quest.
   * @returns {any | null}
   */
  getAvailableQuest() {
    if (this.getCurrentQuest()) return null; // E2: Cannot accept new quest while another is active/completed
    return this.quests.find(q => q.status === 'available') || null;
  }

  /**
   * Accepts a quest by ID.
   * @param {string} questId
   * @returns {boolean}
   */
  acceptQuest(questId) {
    // E2: Ordering check - ensure no active quest
    if (this.getCurrentQuest()) return false;

    const quest = this.quests.find(q => q.id === questId && q.status === 'available');
    if (!quest) return false;

    quest.status = 'active';
    this._emit();
    return true;
  }

  /**
   * Verifies an objective (spoken or typed word against target word).
   * If correct and matches active quest, transitions quest to 'completed'.
   * @param {string} targetWord
   * @param {string} answerWord
   * @returns {{ success: boolean, questCompleted: boolean }}
   */
  checkObjective(targetWord, answerWord) {
    if (!targetWord || !answerWord) return { success: false, questCompleted: false };

    const normTarget = targetWord.trim().toLowerCase().replace(/[.,!?;:]/g, '');
    const normAnswer = answerWord.trim().toLowerCase().replace(/[.,!?;:]/g, '');

    const isMatch = normAnswer === normTarget || normAnswer.includes(normTarget);
    if (!isMatch) {
      return { success: false, questCompleted: false };
    }

    const current = this.getCurrentQuest();
    if (current && current.status === 'active') {
      const currentNorm = current.targetWord.trim().toLowerCase();
      if (currentNorm === normTarget) {
        current.status = 'completed';
        this._emit();
        return { success: true, questCompleted: true };
      }
    }

    return { success: true, questCompleted: false };
  }

  /**
   * Turns in completed quest to NPC to claim rewards.
   * Prevents duplicate clicks / spamming (E4 idempotency).
   * @param {string} questId
   * @returns {{ success: boolean, reward?: { exp: number, badge: string } }}
   */
  turnInQuest(questId) {
    if (this.isProcessingTurnIn) return { success: false };

    const quest = this.quests.find(q => q.id === questId);
    if (!quest || quest.status !== 'completed') {
      return { success: false };
    }

    this.isProcessingTurnIn = true;
    quest.status = 'rewarded';
    this.exp += quest.reward.exp;
    if (!this.badges.includes(quest.reward.badge)) {
      this.badges.push(quest.reward.badge);
    }

    this._emit();

    setTimeout(() => {
      this.isProcessingTurnIn = false;
    }, 600);

    return { success: true, reward: quest.reward };
  }

  isAllCompleted() {
    return this.quests.every(q => q.status === 'rewarded');
  }

  getStats() {
    return {
      exp: this.exp,
      badges: [...this.badges],
      totalQuests: this.quests.length,
      rewardedCount: this.quests.filter(q => q.status === 'rewarded').length
    };
  }
}
