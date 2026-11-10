import * as THREE from 'three';
import { createScene } from './scene.js';

const container = document.getElementById('canvas-container');
const sceneManager = createScene(container);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  sceneManager.update(delta);
}

animate();
