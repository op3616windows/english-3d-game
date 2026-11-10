import * as THREE from 'three';
import { createScene } from './scene.js';
import { InputManager } from './input.js';
import { CharacterController } from './character.js';
import { InteractableManager, createDefaultInteractables } from './interactables.js';
import { AudioService } from './audio.js';
import { VocabModal } from './vocabModal.js';
import { NPCController } from './npc.js';
import { DialogueManager } from './dialogue.js';

const container = document.getElementById('canvas-container');
const uiOverlay = document.getElementById('ui-overlay');
const sceneManager = createScene(container);

const inputManager = new InputManager();
const characterController = new CharacterController(sceneManager.scene, sceneManager.camera);

const audioService = new AudioService();
const vocabModal = new VocabModal(uiOverlay, audioService);
const dialogueManager = new DialogueManager(uiOverlay);

const npcController = new NPCController(sceneManager.scene, { x: 3.5, y: 0, z: -2.0 });

// Pause player movement when reading vocabulary card or talking to NPC
vocabModal.onOpen(() => inputManager.setEnabled(false));
vocabModal.onClose(() => inputManager.setEnabled(true));

dialogueManager.onOpen(() => inputManager.setEnabled(false));
dialogueManager.onClose(() => inputManager.setEnabled(true));

const interactableManager = new InteractableManager(
  sceneManager.scene,
  sceneManager.camera,
  sceneManager.renderer.domElement
);
createDefaultInteractables(sceneManager.scene, interactableManager);

function tryInteract() {
  if (vocabModal.isOpen() || dialogueManager.isOpen()) return;

  const playerPos = characterController.getPosition();
  const npcDist = playerPos.distanceTo(npcController.getPosition());

  // Prioritize NPC conversation if close to Teacher Alex
  if (npcDist <= 4.5) {
    dialogueManager.show({
      speaker: 'Teacher Alex',
      text: "Hello! Welcome to WordQuest 3D. I'm Teacher Alex. Explore our classroom to find vocabulary items, or ask me for a special quest!",
      options: [
        { label: "Hello Teacher! I'm ready to learn.", action: "ready" },
        { label: "Just looking around.", action: "close" }
      ]
    }, (choice) => {
      if (choice.action === 'ready') {
        dialogueManager.show({
          speaker: 'Teacher Alex',
          text: "Great enthusiasm! You can walk up to objects like the Book or Apple, press E to see their pronunciation card, or complete speech challenges!",
          options: [
            { label: "Thanks! I'll try right now.", action: "close" }
          ]
        }, () => dialogueManager.close());
      } else {
        dialogueManager.close();
      }
    });
    return;
  }

  // Otherwise check interactable vocabulary props
  const current = interactableManager.update(playerPos);
  if (current && current.vocab) {
    vocabModal.open(current.vocab);
  } else {
    const nearby = interactableManager.getNearbyInteractable(playerPos, 5.5);
    if (nearby && nearby.vocab) {
      vocabModal.open(nearby.vocab);
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
  if (!vocabModal.isOpen() && !dialogueManager.isOpen()) {
    interactableManager.update(playerPos);
  }

  sceneManager.update(delta);
}

animate();
