import * as THREE from 'three';
import { createScene } from './scene.js';
import { ZoneManager } from './zoneManager.js';
import { Minimap } from './minimap.js';
import { InputManager } from './input.js';
import { CharacterController } from './character.js';
import { InteractableManager, createDefaultInteractables } from './interactables.js';
import { AudioService } from './audio.js';
import { VocabModal } from './vocabModal.js';
import { NPCController } from './npc.js';
import { DialogueManager, VoiceChallengeModal, QuestCelebrationBanner, QuestTrackerHUD } from './dialogue.js';
import { QuestEngine } from './quest.js';
import { VoiceService } from './voice.js';
import { InventoryManager } from './inventory.js';
import { ProgressionManager } from './progression.js';
import { StorageService } from './storage.js';

const container = document.getElementById('canvas-container');
const uiOverlay = document.getElementById('ui-overlay');
const sceneManager = createScene(container);

// Clear static default room so ZoneManager manages dynamic room rendering (SC4)
if (typeof sceneManager.removeStaticEnvironment === 'function') {
  sceneManager.removeStaticEnvironment();
}

const inputManager = new InputManager();
const characterController = new CharacterController(sceneManager.scene, sceneManager.camera);

// Provide setPosition on characterController for portal teleportation (SC1)
characterController.setPosition = function (x, y, z) {
  this.group.position.set(x, y, z);
  this.camera.position.copy(this.group.position).add(this.cameraOffset);
};

const zoneManager = new ZoneManager(sceneManager);
const minimap = new Minimap(uiOverlay, zoneManager, characterController);

const audioService = new AudioService();
const voiceService = new VoiceService();
const questEngine = new QuestEngine();
const progressionManager = new ProgressionManager(uiOverlay);
const inventoryManager = new InventoryManager(uiOverlay, audioService);
const storageService = new StorageService();

const vocabModal = new VocabModal(uiOverlay, audioService);
const dialogueManager = new DialogueManager(uiOverlay);
const voiceChallengeModal = new VoiceChallengeModal(uiOverlay, voiceService, audioService);
const celebrationBanner = new QuestCelebrationBanner(uiOverlay);
const questTracker = new QuestTrackerHUD(uiOverlay, questEngine);

const npcController = new NPCController(sceneManager.scene, { x: 3.5, y: 0, z: -2.0 });

// Pause player movement when any modal or dialogue is active
vocabModal.onOpen(() => inputManager.setEnabled(false));
vocabModal.onClose(() => inputManager.setEnabled(true));

dialogueManager.onOpen(() => inputManager.setEnabled(false));
dialogueManager.onClose(() => inputManager.setEnabled(true));

voiceChallengeModal.onOpen(() => inputManager.setEnabled(false));
voiceChallengeModal.onClose(() => inputManager.setEnabled(true));

inventoryManager.onOpen(() => inputManager.setEnabled(false));
inventoryManager.onClose(() => inputManager.setEnabled(true));

// Setup HUD Elements
const levelBadge = document.getElementById('hud-level-badge');
const xpText = document.getElementById('hud-xp-text');
const xpBarFill = document.getElementById('hud-xp-bar-fill');
const inventoryBtn = document.getElementById('hud-inventory-btn');
const inventoryBadge = document.getElementById('hud-inventory-badge');

if (inventoryBtn) {
  inventoryBtn.addEventListener('click', () => {
    if (inventoryManager.isOpen()) {
      inventoryManager.close();
    } else {
      inventoryManager.open();
    }
  });
}

// Update HUD when XP changes
progressionManager.onXPChange(({ xp, nextXP, level, ratio }) => {
  if (levelBadge) levelBadge.textContent = `LV ${level}`;
  if (xpText) xpText.textContent = `${xp} / ${nextXP} XP`;
  if (xpBarFill) xpBarFill.style.width = `${Math.round(ratio * 100)}%`;
});

// Update inventory badge count
inventoryManager.onChange((items) => {
  if (inventoryBadge) inventoryBadge.textContent = `${items.length}`;
});

// LocalStorage Persistence (E3, SC3)
let isRestoringState = false;

function saveGameState() {
  if (isRestoringState) return;
  const playerPos = characterController.getPosition();
  const questsState = questEngine.quests.map(q => ({ id: q.id, status: q.status }));

  storageService.save({
    level: progressionManager.getLevel(),
    xp: progressionManager.getXP(),
    inventory: inventoryManager.getItems(),
    quests: questsState,
    badges: questEngine.badges,
    playerPos: { x: playerPos.x, y: playerPos.y, z: playerPos.z }
  });
}

function loadGameState() {
  isRestoringState = true;
  const saved = storageService.load();

  if (saved) {
    // 1. Restore Level & XP
    progressionManager.loadFromData({ level: saved.level, xp: saved.xp });

    // 2. Restore Inventory
    if (saved.inventory && Array.isArray(saved.inventory)) {
      inventoryManager.loadFromData(saved.inventory);
    }

    // 3. Restore Quests & Badges
    if (saved.quests && Array.isArray(saved.quests)) {
      saved.quests.forEach(sq => {
        const quest = questEngine.quests.find(q => q.id === sq.id);
        if (quest) {
          quest.status = sq.status;
        }
      });
    }
    if (saved.badges && Array.isArray(saved.badges)) {
      questEngine.badges = [...saved.badges];
    }
    questEngine._emit();

    // 4. Restore Player Position
    if (saved.playerPos && typeof saved.playerPos.x === 'number') {
      characterController.group.position.set(saved.playerPos.x, saved.playerPos.y, saved.playerPos.z);
    }
  }

  isRestoringState = false;
}

// Restore saved progress on startup
loadGameState();

// Auto-save triggers
inventoryManager.onChange(() => saveGameState());
progressionManager.onXPChange(() => saveGameState());
questEngine.onQuestChange(() => saveGameState());

inventoryManager.onReset(() => {
  storageService.clear();
  window.location.reload();
});

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => saveGameState());
  window.resetWordQuestProgress = () => {
    storageService.clear();
    window.location.reload();
  };
}

// Periodic auto-save every 4 seconds to capture player position
setInterval(() => {
  saveGameState();
}, 4000);

const interactableManager = new InteractableManager(
  sceneManager.scene,
  sceneManager.camera,
  sceneManager.renderer.domElement
);

// Load interactable 3D vocabulary models for active room zone (SC2)
interactableManager.loadZoneInteractables(zoneManager.currentZoneId);

// Handle room switching: reload thematic vocab and toggle NPC classroom presence
zoneManager.onZoneChange((zone) => {
  interactableManager.loadZoneInteractables(zone.id);
  if (npcController && npcController.group) {
    npcController.group.visible = (zone.id === 'study_room');
  }
});

// Handle quest challenge launch
function openChallengeForWord(word, ipa) {
  voiceChallengeModal.open({ word, ipa }, (matchedWord) => {
    const res = questEngine.checkObjective(word, matchedWord);
    // Reward XP for completing speech challenge
    progressionManager.addXP(35);
    saveGameState();
  });
}

function handleNPCDialogue() {
  const currentQuest = questEngine.getCurrentQuest();
  const availableQuest = questEngine.getAvailableQuest();

  // Case 1: Quest objective completed -> Turn in quest & claim reward (SC4, E4)
  if (currentQuest && currentQuest.status === 'completed') {
    dialogueManager.show({
      speaker: 'Teacher Alex',
      text: currentQuest.npcReward || `Excellent work! You mastered the pronunciation for "${currentQuest.targetWord}"!`,
      options: [
        {
          label: `🏆 Nhận phần thưởng (+${currentQuest.reward.exp} XP, Huy hiệu ${currentQuest.reward.badge})`,
          action: 'claim'
        }
      ]
    }, (choice) => {
      if (choice.action === 'claim') {
        const res = questEngine.turnInQuest(currentQuest.id);
        dialogueManager.close();
        if (res.success) {
          progressionManager.addXP(res.reward.exp);
          celebrationBanner.show(currentQuest.title, res.reward);
          saveGameState();
        }
      } else {
        dialogueManager.close();
      }
    });
    return;
  }

  // Case 2: Quest currently active -> Remind player of target or offer immediate pronunciation test (E2, SC2)
  if (currentQuest && currentQuest.status === 'active') {
    dialogueManager.show({
      speaker: 'Teacher Alex',
      text: currentQuest.npcReminder || `Have you found the ${currentQuest.targetObject} yet? Go check it out and say "${currentQuest.targetWord}"!`,
      options: [
        { label: `🎤 Thử thách phát âm từ "${currentQuest.targetWord}" ngay`, action: 'practice_now' },
        { label: `Tôi sẽ đi tìm ${currentQuest.targetObject} trong phòng`, action: 'close' }
      ]
    }, (choice) => {
      dialogueManager.close();
      if (choice.action === 'practice_now') {
        openChallengeForWord(currentQuest.targetWord, currentQuest.ipa);
      }
    });
    return;
  }

  // Case 3: Available quest ready to be accepted (SC1, SC2)
  if (availableQuest) {
    dialogueManager.show({
      speaker: 'Teacher Alex',
      text: availableQuest.npcOffer,
      options: [
        { label: `Nhận nhiệm vụ: ${availableQuest.title}`, action: 'accept_quest' },
        { label: 'Chào thầy! Tôi đang khám phá xung quanh.', action: 'close' }
      ]
    }, (choice) => {
      if (choice.action === 'accept_quest') {
        questEngine.acceptQuest(availableQuest.id);
        saveGameState();
        dialogueManager.show({
          speaker: 'Teacher Alex',
          text: `Tuyệt vời! Hãy tìm "${availableQuest.targetObject}" và hoàn thành thử thách phát âm nhé!`,
          options: [
            { label: 'Bắt đầu ngay!', action: 'close' }
          ]
        }, () => dialogueManager.close());
      } else {
        dialogueManager.close();
      }
    });
    return;
  }

  // Case 4: All quests completed
  dialogueManager.show({
    speaker: 'Teacher Alex',
    text: "Amazing job! You have completed all English quests and mastered every vocabulary item in our 3D classroom. You are a true English Champion!",
    options: [
      { label: "Cảm ơn thầy Alex!", action: 'close' }
    ]
  }, () => dialogueManager.close());
}

function tryInteract() {
  if (vocabModal.isOpen() || dialogueManager.isOpen() || voiceChallengeModal.isOpen() || inventoryManager.isOpen()) return;

  const playerPos = characterController.getPosition();

  // E1: Prioritize NPC conversation if in Study Room and close to Teacher Alex (dist <= 4.5m)
  if (zoneManager.currentZoneId === 'study_room') {
    const npcDist = playerPos.distanceTo(npcController.getPosition());
    if (npcDist <= 4.5) {
      handleNPCDialogue();
      return;
    }
  }

  // Otherwise check interactable vocabulary props
  const current = interactableManager.update(playerPos) || interactableManager.getNearbyInteractable(playerPos, 5.5);
  if (current && current.vocab) {
    const vocab = current.vocab;
    const currentQuest = questEngine.getCurrentQuest();

    // Collect into Inventory & award discovery XP
    const added = inventoryManager.addItem(vocab);
    if (added) {
      progressionManager.addXP(25);
    }
    saveGameState();

    // Open vocabulary card
    vocabModal.open(vocab);

    // If active quest is targeting this object, queue challenge modal upon closing or prompt
    if (currentQuest && currentQuest.status === 'active' && currentQuest.targetWord.toLowerCase() === vocab.word.toLowerCase()) {
      const onModalClose = () => {
        vocabModal.onCloseCallbacks = vocabModal.onCloseCallbacks.filter(fn => fn !== onModalClose);
        // Prompt pronunciation challenge for this quest object
        setTimeout(() => {
          openChallengeForWord(vocab.word, vocab.ipa);
        }, 200);
      };
      vocabModal.onClose(onModalClose);
    }
  }
}

// Click on canvas to interact
container.addEventListener('click', () => {
  tryInteract();
});

// Press 'E' key to interact
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyE') {
    tryInteract();
  }
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1); // cap delta to prevent tunneling

  // Update player movement and camera
  const moveVector = inputManager.getMoveVector();
  characterController.update(delta, moveVector);

  // Check portal overlap to switch room environments seamlessly (SC1, SC4)
  if (!zoneManager.isTransitioning) {
    const portalTarget = zoneManager.checkPortalOverlap(characterController.getPosition());
    if (portalTarget) {
      zoneManager.switchZone(portalTarget, characterController);
    }
  }

  // Update NPC animations (waving, breathing) if visible in Study Room
  if (npcController && npcController.group && npcController.group.visible) {
    npcController.update(delta);
  }

  // Update portal visual effects & minimap radar (SC3)
  zoneManager.update(delta);
  minimap.update();

  // Update 3D hover raycast and distance highlight
  const playerPos = characterController.getPosition();
  if (!vocabModal.isOpen() && !dialogueManager.isOpen() && !voiceChallengeModal.isOpen() && !inventoryManager.isOpen()) {
    interactableManager.update(playerPos);
  }

  sceneManager.update(delta);
}

animate();

export { progressionManager, inventoryManager, storageService, zoneManager, minimap };
