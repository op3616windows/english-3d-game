import * as THREE from 'three';
import { createScene } from './scene.js';
import { InputManager } from './input.js';
import { CharacterController } from './character.js';

const container = document.getElementById('canvas-container');
const sceneManager = createScene(container);

const inputManager = new InputManager();
const characterController = new CharacterController(sceneManager.scene, sceneManager.camera);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1); // cap delta to prevent tunneling

  const moveVector = inputManager.getMoveVector();
  characterController.update(delta, moveVector);
  sceneManager.update(delta);
}

animate();
