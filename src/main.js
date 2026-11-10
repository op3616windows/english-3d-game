import * as THREE from 'three';
import { createScene } from './scene.js';
import { InputManager } from './input.js';
import { CharacterController } from './character.js';
import { InteractableManager, createDefaultInteractables } from './interactables.js';

const container = document.getElementById('canvas-container');
const sceneManager = createScene(container);

const inputManager = new InputManager();
const characterController = new CharacterController(sceneManager.scene, sceneManager.camera);

const interactableManager = new InteractableManager(
  sceneManager.scene,
  sceneManager.camera,
  sceneManager.renderer.domElement
);
createDefaultInteractables(sceneManager.scene, interactableManager);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1); // cap delta to prevent tunneling

  const moveVector = inputManager.getMoveVector();
  characterController.update(delta, moveVector);

  const playerPos = characterController.getPosition();
  interactableManager.update(playerPos);

  sceneManager.update(delta);
}

animate();
