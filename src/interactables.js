import * as THREE from 'three';

/**
 * Metadata schema for vocabulary items:
 * { id: string, word: string, ipa: string, meaning: string, example: string }
 */

export class InteractableManager {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.PerspectiveCamera} camera
   * @param {HTMLElement} domElement
   */
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement || window;

    this.interactables = [];
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-999, -999);
    this.pointerActive = false;

    this.currentTarget = null;
    this.currentVocab = null;

    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);

    if (this.domElement) {
      this.domElement.addEventListener('pointermove', this._onPointerMove);
      this.domElement.addEventListener('pointerleave', this._onPointerLeave);
    }

    this._initPromptElement();
  }

  _initPromptElement() {
    let prompt = document.getElementById('interaction-prompt');
    if (!prompt) {
      prompt = document.createElement('div');
      prompt.id = 'interaction-prompt';
      prompt.style.position = 'absolute';
      prompt.style.bottom = '80px';
      prompt.style.left = '50%';
      prompt.style.transform = 'translateX(-50%)';
      prompt.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
      prompt.style.color = '#ffffff';
      prompt.style.padding = '10px 20px';
      prompt.style.borderRadius = '24px';
      prompt.style.border = '1px solid rgba(56, 189, 248, 0.5)';
      prompt.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
      prompt.style.fontSize = '14px';
      prompt.style.fontWeight = '500';
      prompt.style.pointerEvents = 'none';
      prompt.style.display = 'none';
      prompt.style.alignItems = 'center';
      prompt.style.gap = '8px';
      prompt.style.zIndex = '20';
      prompt.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

      const overlay = document.getElementById('ui-overlay') || document.body;
      overlay.appendChild(prompt);
    }
    this.promptElement = prompt;
  }

  _onPointerMove(event) {
    const rect = this.domElement.getBoundingClientRect
      ? this.domElement.getBoundingClientRect()
      : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.pointerActive = true;
  }

  _onPointerLeave() {
    this.pointerActive = false;
    this.pointer.set(-999, -999);
  }

  /**
   * Registers a 3D object as interactable with associated vocabulary metadata.
   * @param {THREE.Object3D} object3D
   * @param {{ id: string, word: string, ipa: string, meaning: string, example: string }} vocabData
   */
  addInteractable(object3D, vocabData) {
    object3D.userData.vocab = vocabData;

    // Cache original materials and colors for smooth highlight toggle
    const meshes = [];
    object3D.traverse((child) => {
      if (child.isMesh && child.material) {
        // Clone material so instances don't share emissive mutations
        child.material = child.material.clone();
        child.userData.originalEmissive = child.material.emissive
          ? child.material.emissive.clone()
          : new THREE.Color(0x000000);
        child.userData.originalEmissiveIntensity = child.material.emissiveIntensity || 0;
        meshes.push(child);
      }
    });

    this.interactables.push({
      group: object3D,
      meshes,
      vocab: vocabData,
    });
  }

  _setHighlight(item, active) {
    if (!item) return;
    const highlightColor = new THREE.Color(0x38bdf8); // Sky blue glow

    item.meshes.forEach((mesh) => {
      if (mesh.material && mesh.material.emissive) {
        if (active) {
          mesh.material.emissive.copy(highlightColor);
          mesh.material.emissiveIntensity = 0.55;
        } else {
          mesh.material.emissive.copy(mesh.userData.originalEmissive || new THREE.Color(0x000000));
          mesh.material.emissiveIntensity = mesh.userData.originalEmissiveIntensity || 0;
        }
      }
    });
  }

  _showPrompt(vocab) {
    if (!this.promptElement) return;
    this.promptElement.innerHTML = `
      <span style="background: #0284c7; color: #fff; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 12px;">E</span>
      <span>hoặc Click để xem từ vựng:</span>
      <strong style="color: #38bdf8; font-size: 15px;">${vocab.word}</strong>
    `;
    this.promptElement.style.display = 'flex';
  }

  _hidePrompt() {
    if (this.promptElement) {
      this.promptElement.style.display = 'none';
    }
  }

  /**
   * Updates raycast detection and proximity checking per frame.
   * @param {THREE.Vector3} playerPosition
   * @returns {{ target: THREE.Object3D | null, vocab: Object | null }}
   */
  update(playerPosition) {
    const maxInteractDist = 6.0;
    const autoFocusDist = 3.5;

    let closestItem = null;
    let closestDist = Infinity;

    // Check distances to player
    const worldPos = new THREE.Vector3();
    const candidateMeshes = [];
    const meshToItemMap = new Map();

    for (const item of this.interactables) {
      item.group.getWorldPosition(worldPos);
      const dist = playerPosition.distanceTo(worldPos);

      if (dist <= maxInteractDist) {
        for (const mesh of item.meshes) {
          candidateMeshes.push(mesh);
          meshToItemMap.set(mesh, item);
        }
        if (dist < closestDist) {
          closestDist = dist;
          closestItem = item;
        }
      }
    }

    let detectedItem = null;

    // 1. Raycast hover detection if pointer is active
    if (this.pointerActive && candidateMeshes.length > 0) {
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(candidateMeshes, false);
      if (intersects.length > 0) {
        detectedItem = meshToItemMap.get(intersects[0].object) || null;
      }
    }

    // 2. Proximity auto-focus if player is close and no mouse hover
    if (!detectedItem && closestItem && closestDist <= autoFocusDist) {
      detectedItem = closestItem;
    }

    // Handle highlight changes
    if (detectedItem !== this.currentTarget) {
      if (this.currentTarget) {
        this._setHighlight(this.currentTarget, false);
      }
      this.currentTarget = detectedItem;
      this.currentVocab = detectedItem ? detectedItem.vocab : null;

      if (detectedItem) {
        this._setHighlight(detectedItem, true);
        this._showPrompt(detectedItem.vocab);
      } else {
        this._hidePrompt();
      }
    }

    return {
      target: this.currentTarget ? this.currentTarget.group : null,
      vocab: this.currentVocab,
    };
  }

  /**
   * Returns the nearest interactable within distance.
   * @param {THREE.Vector3} playerPosition
   * @param {number} maxDistance
   */
  getNearbyInteractable(playerPosition, maxDistance = 6.0) {
    const worldPos = new THREE.Vector3();
    let best = null;
    let minDist = maxDistance;

    for (const item of this.interactables) {
      item.group.getWorldPosition(worldPos);
      const d = playerPosition.distanceTo(worldPos);
      if (d <= minDist) {
        minDist = d;
        best = item;
      }
    }

    return best;
  }

  dispose() {
    if (this.currentTarget) {
      this._setHighlight(this.currentTarget, false);
      this.currentTarget = null;
      this.currentVocab = null;
    }
    if (this.promptElement && this.promptElement.parentNode) {
      this.promptElement.parentNode.removeChild(this.promptElement);
    }
    if (this.domElement) {
      this.domElement.removeEventListener('pointermove', this._onPointerMove);
      this.domElement.removeEventListener('pointerleave', this._onPointerLeave);
    }
  }
}

/**
 * Builds standard low-poly classroom / study room furniture and vocabulary props.
 * @param {THREE.Scene} scene
 * @param {InteractableManager} manager
 */
export function createDefaultInteractables(scene, manager) {
  // 1. Desk (Table)
  const deskGroup = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4 });

  const topGeo = new THREE.BoxGeometry(3.2, 0.18, 2.0);
  const topMesh = new THREE.Mesh(topGeo, woodMat);
  topMesh.position.y = 1.4;
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  deskGroup.add(topMesh);

  const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8);
  const legPositions = [
    [-1.4, 0.7, -0.8],
    [1.4, 0.7, -0.8],
    [-1.4, 0.7, 0.8],
    [1.4, 0.7, 0.8],
  ];
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    deskGroup.add(leg);
  });

  deskGroup.position.set(0, 0, -4);
  scene.add(deskGroup);
  manager.addInteractable(deskGroup, {
    id: 'table',
    word: 'Table',
    ipa: '/ˈteɪ.bəl/',
    meaning: 'Cái bàn, bàn học',
    example: 'There are interesting English study items on the table.',
  });

  // 2. Book
  const bookGroup = new THREE.Group();
  const coverMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
  const pageMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });

  const coverGeo = new THREE.BoxGeometry(0.55, 0.08, 0.75);
  const coverMesh = new THREE.Mesh(coverGeo, coverMat);
  coverMesh.castShadow = true;
  bookGroup.add(coverMesh);

  const pageGeo = new THREE.BoxGeometry(0.5, 0.06, 0.7);
  const pageMesh = new THREE.Mesh(pageGeo, pageMat);
  pageMesh.position.set(0.02, 0, 0);
  bookGroup.add(pageMesh);

  bookGroup.position.set(-0.9, 1.53, -4.0);
  bookGroup.rotation.y = 0.25;
  scene.add(bookGroup);
  manager.addInteractable(bookGroup, {
    id: 'book',
    word: 'Book',
    ipa: '/bʊk/',
    meaning: 'Cuốn sách',
    example: 'She is reading an interesting English grammar book.',
  });

  // 3. Apple
  const appleGroup = new THREE.Group();
  const appleMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });

  const fruitGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const fruitMesh = new THREE.Mesh(fruitGeo, appleMat);
  fruitMesh.castShadow = true;
  appleGroup.add(fruitMesh);

  const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6);
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.position.set(0, 0.19, 0);
  appleGroup.add(stemMesh);

  const leafGeo = new THREE.BoxGeometry(0.1, 0.02, 0.06);
  const leafMesh = new THREE.Mesh(leafGeo, leafMat);
  leafMesh.position.set(0.05, 0.21, 0);
  leafMesh.rotation.z = -0.3;
  appleGroup.add(leafMesh);

  appleGroup.position.set(0.9, 1.67, -3.7);
  scene.add(appleGroup);
  manager.addInteractable(appleGroup, {
    id: 'apple',
    word: 'Apple',
    ipa: '/ˈæp.əl/',
    meaning: 'Quả táo',
    example: 'An apple a day keeps the doctor away.',
  });

  // 4. Laptop
  const laptopGroup = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });
  const screenBorderMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  const screenGlowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.5,
  });

  const baseGeo = new THREE.BoxGeometry(0.85, 0.04, 0.65);
  const baseMesh = new THREE.Mesh(baseGeo, bodyMat);
  baseMesh.castShadow = true;
  laptopGroup.add(baseMesh);

  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.02, -0.32);
  lidGroup.rotation.x = 0.3; // Tilted screen

  const lidGeo = new THREE.BoxGeometry(0.85, 0.58, 0.03);
  const lidMesh = new THREE.Mesh(lidGeo, screenBorderMat);
  lidMesh.position.set(0, 0.29, 0);
  lidMesh.castShadow = true;
  lidGroup.add(lidMesh);

  const displayGeo = new THREE.PlaneGeometry(0.78, 0.5);
  const displayMesh = new THREE.Mesh(displayGeo, screenGlowMat);
  displayMesh.position.set(0, 0.29, 0.02);
  lidGroup.add(displayMesh);

  laptopGroup.add(lidGroup);
  laptopGroup.position.set(0, 1.51, -4.1);
  scene.add(laptopGroup);
  manager.addInteractable(laptopGroup, {
    id: 'laptop',
    word: 'Laptop',
    ipa: '/ˈlæp.tɒp/',
    meaning: 'Máy tính xách tay',
    example: 'I use my laptop every day to study English online.',
  });

  // 5. Chair
  const chairGroup = new THREE.Group();
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
  const chairLegMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 });

  const seatGeo = new THREE.BoxGeometry(1.0, 0.1, 1.0);
  const seatMesh = new THREE.Mesh(seatGeo, chairMat);
  seatMesh.position.y = 0.8;
  seatMesh.castShadow = true;
  chairGroup.add(seatMesh);

  const backGeo = new THREE.BoxGeometry(1.0, 0.8, 0.1);
  const backMesh = new THREE.Mesh(backGeo, chairMat);
  backMesh.position.set(0, 1.25, 0.45);
  backMesh.castShadow = true;
  chairGroup.add(backMesh);

  const chairLegGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
  const chairLegPositions = [
    [-0.42, 0.4, -0.42],
    [0.42, 0.4, -0.42],
    [-0.42, 0.4, 0.42],
    [0.42, 0.4, 0.42],
  ];
  chairLegPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(chairLegGeo, chairLegMat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    chairGroup.add(leg);
  });

  chairGroup.position.set(0, 0, -2.4);
  scene.add(chairGroup);
  manager.addInteractable(chairGroup, {
    id: 'chair',
    word: 'Chair',
    ipa: '/tʃeər/',
    meaning: 'Cái ghế',
    example: 'Please sit down on the comfortable blue chair.',
  });
}
