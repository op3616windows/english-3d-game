import * as THREE from 'three';
import { createScene } from './scene.js';
import { InputManager } from './input.js';
import { CharacterController } from './character.js';
import { InteractableManager, createDefaultInteractables } from './interactables.js';
import { AudioService } from './audio.js';
import { VocabModal } from './vocabModal.js';
import { NPCController } from './npc.js';
import { DialogueManager, VoiceChallengeModal, QuestCelebrationBanner, QuestTrackerHUD } from './dialogue.js';
import { QuestEngine } from './quest.js';
import { VoiceService } from './voice.js';

const container = document.getElementById('canvas-container');
const uiOverlay = document.getElementById('ui-overlay');
const sceneManager = createScene(container);

const inputManager = new InputManager();
const characterController = new CharacterController(sceneManager.scene, sceneManager.camera);

const audioService = new AudioService();
const voiceService = new VoiceService();
const questEngine = new QuestEngine();

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

const interactableManager = new InteractableManager(
  sceneManager.scene,
  sceneManager.camera,
  sceneManager.renderer.domElement
);
createDefaultInteractables(sceneManager.scene, interactableManager);

// Handle quest challenge launch
function openChallengeForWord(word, ipa) {
  voiceChallengeModal.open({ word, ipa }, (matchedWord) => {
    questEngine.checkObjective(word, matchedWord);
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
          label: `🏆 Nhận phần thưởng (+${currentQuest.reward.exp} EXP, Huy hiệu ${currentQuest.reward.badge})`,
          action: 'claim'
        }
      ]
    }, (choice) => {
      if (choice.action === 'claim') {
        const res = questEngine.turnInQuest(currentQuest.id);
        dialogueManager.close();
        if (res.success) {
          celebrationBanner.show(currentQuest.title, res.reward);
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
  if (vocabModal.isOpen() || dialogueManager.isOpen() || voiceChallengeModal.isOpen()) return;

  const playerPos = characterController.getPosition();
  const npcDist = playerPos.distanceTo(npcController.getPosition());

  // E1: Prioritize NPC conversation if close to Teacher Alex (dist <= 4.5m)
  if (npcDist <= 4.5) {
    handleNPCDialogue();
    return;
  }

  // Otherwise check interactable vocabulary props
  const current = interactableManager.update(playerPos) || interactableManager.getNearbyInteractable(playerPos, 5.5);
  if (current && current.vocab) {
    const vocab = current.vocab;
    const currentQuest = questEngine.getCurrentQuest();

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

  // Update NPC animations (waving, breathing)
  npcController.update(delta);

  // Update 3D hover raycast and distance highlight
  const playerPos = characterController.getPosition();
  if (!vocabModal.isOpen() && !dialogueManager.isOpen() && !voiceChallengeModal.isOpen()) {
    interactableManager.update(playerPos);
  }

  sceneManager.update(delta);
}

animate();
