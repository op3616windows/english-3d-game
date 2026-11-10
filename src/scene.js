import * as THREE from 'three';
export { ZoneManager } from './zoneManager.js';

/**
 * Initializes and manages the Three.js 3D scene.
 * @param {HTMLElement} container - The DOM element holding the WebGL canvas.
 * @returns {{ scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, update: (delta: number) => void, removeStaticEnvironment: () => void }}
 */
export function createScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e293b);
  scene.fog = new THREE.FogExp2(0x1e293b, 0.025);

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(0, 6, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.2);
  dirLight.position.set(15, 25, 15);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 50;
  dirLight.shadow.camera.left = -20;
  dirLight.shadow.camera.right = 20;
  dirLight.shadow.camera.top = 20;
  dirLight.shadow.camera.bottom = -20;
  scene.add(dirLight);

  // Default static environment group (can be cleared when ZoneManager takes over)
  const staticEnvGroup = new THREE.Group();
  scene.add(staticEnvGroup);

  const floorSize = 40;
  const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.8,
    metalness: 0.1,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  staticEnvGroup.add(floor);

  // Visual grid helper
  const gridHelper = new THREE.GridHelper(floorSize, 40, 0x38bdf8, 0x475569);
  gridHelper.position.y = 0.01;
  staticEnvGroup.add(gridHelper);

  // Boundary markers
  const boundaryGeo = new THREE.BoxGeometry(floorSize, 0.5, 0.5);
  const boundaryMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
  const wallZ1 = new THREE.Mesh(boundaryGeo, boundaryMat);
  wallZ1.position.set(0, 0.25, floorSize / 2);
  const wallZ2 = new THREE.Mesh(boundaryGeo, boundaryMat);
  wallZ2.position.set(0, 0.25, -floorSize / 2);
  staticEnvGroup.add(wallZ1, wallZ2);

  const removeStaticEnvironment = () => {
    while (staticEnvGroup.children.length > 0) {
      const obj = staticEnvGroup.children[0];
      staticEnvGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }
    scene.remove(staticEnvGroup);
  };

  // Window resize handler
  const handleResize = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  /**
   * Updates scene elements per frame.
   * @param {number} delta - Elapsed time since last frame in seconds.
   */
  const update = (delta) => {
    renderer.render(scene, camera);
  };

  return { scene, camera, renderer, update, removeStaticEnvironment };
}
