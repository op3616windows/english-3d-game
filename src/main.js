import * as THREE from 'three';
import { createScene } from './scene.js';
import { InputManager } from './input.js';
import { CharacterController } from './character.js';
import { InteractableManager, createDefaultInteractables } from './interactables.js';
import { AudioService } from './audio.js';
import { VocabModal } from './vocabModal.js';

const container = document.getElementById('canvas-container');
const uiOverlay = document.getElementById('ui-overlay');
const sceneManager = createScene(container);

const inputManager = new InputManager();
const characterController = new CharacterController(sceneManager.scene, sceneManager.camera);

const audioService = new AudioService();
const vocabModal = new VocabModal(uiOverlay, audioService);

// Pause player movement when reading vocabulary card modal
vocabModal.onOpen(() => {
  inputManager.setEnabled(false);
});

vocabModal.onClose(() => {
  inputManager.setEnabled(true);
});

const interactableManager = new InteractableManager(
  sceneManager.scene,
  sceneManager.camera,
  sceneManager.renderer.domElement
);
createDefaultInteractables(sceneManager.scene, interactableManager);

function tryInteract() {
  if (vocabModal.isOpen()) return;

  const playerPos = characterController.getPosition();
  const current = interactableManager.update(playerPos);

  if (current && current.vocab) {
    vocabModal.open(current.vocab);
  } else {
    // Check nearest interactable item within 5.5 units
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
  if (e.code === 'KeyE' && !vocabModal.isOpen()) {
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

  // Update 3D hover raycast and distance highlight
  const playerPos = characterController.getPosition();
  if (!vocabModal.isOpen()) {
    interactableManager.update(playerPos);
  }

  sceneManager.update(delta);
}

animate();
