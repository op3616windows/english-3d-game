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
    if (typeof document === 'undefined') return;
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

  /**
   * Cleans up and disposes all current 3D interactables (SC4).
   */
  clearInteractables() {
    if (this.currentTarget) {
      this._setHighlight(this.currentTarget, false);
      this.currentTarget = null;
      this.currentVocab = null;
    }
    this._hidePrompt();

    for (const item of this.interactables) {
      if (item.group && item.group.parent) {
        item.group.parent.remove(item.group);
      }
      item.group.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                if (mat.map) mat.map.dispose();
                mat.dispose();
              });
            } else {
              if (child.material.map) child.material.map.dispose();
              child.material.dispose();
            }
          }
        }
      });
    }
    this.interactables = [];
  }

  /**
   * Loads and displays thematic vocabulary items for the specified zone (SC2).
   * @param {string} zoneId - 'study_room' | 'living_room' | 'kitchen_cafe'
   */
  loadZoneInteractables(zoneId) {
    this.clearInteractables();

    if (zoneId === 'living_room') {
      createLivingRoomInteractables(this.scene, this);
    } else if (zoneId === 'kitchen_cafe') {
      createKitchenCafeInteractables(this.scene, this);
    } else {
      createStudyRoomInteractables(this.scene, this);
    }
  }

  /**
   * Highlights or unhighlights an interactable object.
   * @param {object} item
   * @param {boolean} highlight
   */
  _setHighlight(item, highlight) {
    if (!item || !item.meshes) return;

    item.meshes.forEach((mesh) => {
      if (!mesh.material) return;

      if (highlight) {
        if (mesh.material.emissive) {
          mesh.material.emissive.set(0x38bdf8);
          mesh.material.emissiveIntensity = 0.45;
        }
      } else {
        if (mesh.material.emissive && mesh.userData.originalEmissive) {
          mesh.material.emissive.copy(mesh.userData.originalEmissive);
          mesh.material.emissiveIntensity = mesh.userData.originalEmissiveIntensity || 0;
        }
      }
    });
  }

  /**
   * Shows 2D HUD hover prompt with vocabulary preview.
   * @param {{ word: string, ipa: string, meaning: string }} vocab
   */
  _showPrompt(vocab) {
    if (!this.promptElement) return;

    this.promptElement.innerHTML = `
      <span style="font-size: 16px;">🔍</span>
      <span>Nhấn chuột để học: <strong style="color: #38bdf8;">${vocab.word}</strong> <span style="opacity: 0.7; font-size: 12px;">${vocab.ipa}</span></span>
    `;
    this.promptElement.style.display = 'flex';
  }

  _hidePrompt() {
    if (!this.promptElement) return;
    this.promptElement.style.display = 'none';
  }

  /**
   * Updates raycaster and proximity detection per frame.
   * @param {THREE.Vector3} [playerPosition]
   * @returns {{ target: THREE.Object3D|null, vocab: object|null }}
   */
  update(playerPosition) {
    let detectedItem = null;

    // 1. Raycast from mouse cursor if pointer is active
    if (this.pointerActive && this.pointer.x > -2) {
      this.raycaster.setFromCamera(this.pointer, this.camera);

      const allMeshes = [];
      const meshToItem = new Map();

      for (const item of this.interactables) {
        for (const m of item.meshes) {
          allMeshes.push(m);
          meshToItem.set(m, item);
        }
      }

      const intersects = this.raycaster.intersectObjects(allMeshes, false);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        detectedItem = meshToItem.get(hitMesh) || null;
      }
    }

    // 2. Proximity fallback: detect closest object within 3.5m of character
    if (!detectedItem && playerPosition) {
      let minDist = 3.5;
      const worldPos = new THREE.Vector3();

      for (const item of this.interactables) {
        item.group.getWorldPosition(worldPos);
        const dist = playerPosition.distanceTo(worldPos);
        if (dist < minDist) {
          minDist = dist;
          detectedItem = item;
        }
      }
    }

    // 3. Update highlight state
    if (this.currentTarget !== detectedItem) {
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
    this.clearInteractables();
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
 * Builds Study Room vocabulary items (Table, Book, Apple, Laptop, Chair, Clock, Lamp, Bookshelf).
 */
export function createStudyRoomInteractables(scene, manager) {
  // 1. Desk (Table)
  const deskGroup = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4 });

  const topGeo = new THREE.BoxGeometry(3.2, 0.18, 2.0);
  const topMesh = new THREE.Mesh(topGeo, woodMat);
  topMesh.position.y = 1.4;
  topMesh.castShadow = true;
  deskGroup.add(topMesh);

  const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8);
  [[-1.4, 0.7, -0.8], [1.4, 0.7, -0.8], [-1.4, 0.7, 0.8], [1.4, 0.7, 0.8]].forEach(([x, y, z]) => {
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
  const coverMesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.75), coverMat);
  coverMesh.castShadow = true;
  bookGroup.add(coverMesh);
  const pageMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.7), pageMat);
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
  const appleMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 }));
  appleMesh.castShadow = true;
  appleGroup.add(appleMesh);
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
  const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.65), bodyMat);
  laptopGroup.add(baseMesh);
  const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.58, 0.03), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
  lidMesh.position.set(0, 0.29, -0.3);
  lidMesh.rotation.x = 0.3;
  laptopGroup.add(lidMesh);
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
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 1.0), chairMat);
  seat.position.y = 0.8;
  chairGroup.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.1), chairMat);
  back.position.set(0, 1.25, 0.45);
  chairGroup.add(back);
  chairGroup.position.set(0, 0, -2.4);
  scene.add(chairGroup);
  manager.addInteractable(chairGroup, {
    id: 'chair',
    word: 'Chair',
    ipa: '/tʃeər/',
    meaning: 'Cái ghế',
    example: 'Please sit down on the comfortable blue chair.',
  });

  // 6. Bookshelf
  const shelfGroup = new THREE.Group();
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const shelfMesh = new THREE.Mesh(new THREE.BoxGeometry(3.0, 4.0, 0.8), shelfMat);
  shelfMesh.position.y = 2.0;
  shelfGroup.add(shelfMesh);
  shelfGroup.position.set(-10, 0, -10);
  scene.add(shelfGroup);
  manager.addInteractable(shelfGroup, {
    id: 'bookshelf',
    word: 'Bookshelf',
    ipa: '/ˈbʊk.ʃelf/',
    meaning: 'Giá sách, kệ sách',
    example: 'The wooden bookshelf is full of English storybooks.',
  });
}

/**
 * Builds Living Room thematic vocabulary items (Sofa, TV, Lamp, Carpet, Painting, Coffee Table, Clock, Guitar).
 */
export function createLivingRoomInteractables(scene, manager) {
  // 1. Sofa
  const sofaGroup = new THREE.Group();
  const sofaMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
  const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 1.6), sofaMat);
  seatMesh.position.y = 0.6;
  seatMesh.castShadow = true;
  sofaGroup.add(seatMesh);
  const backMesh = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 0.5), sofaMat);
  backMesh.position.set(0, 1.2, -0.6);
  sofaGroup.add(backMesh);
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 1.6), sofaMat);
  armL.position.set(-1.6, 0.9, 0);
  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 1.6), sofaMat);
  armR.position.set(1.6, 0.9, 0);
  sofaGroup.add(armL, armR);
  sofaGroup.position.set(0, 0, -5);
  scene.add(sofaGroup);
  manager.addInteractable(sofaGroup, {
    id: 'sofa',
    word: 'Sofa',
    ipa: '/ˈsəʊ.fə/',
    meaning: 'Ghế sô-pha',
    example: 'We relaxed on the soft blue sofa in the living room.',
  });

  // 2. Television
  const tvGroup = new THREE.Group();
  const tvBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.9, 0.15), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 }));
  tvGroup.add(tvBody);
  const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.7), new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0369a1,
    emissiveIntensity: 0.5
  }));
  tvScreen.position.set(0, 0, 0.08);
  tvGroup.add(tvScreen);
  tvGroup.position.set(0, 3.2, -14);
  scene.add(tvGroup);
  manager.addInteractable(tvGroup, {
    id: 'television',
    word: 'Television',
    ipa: '/ˈtel.ɪ.vɪʒ.ən/',
    meaning: 'Tivi, truyền hình',
    example: 'The large television screen displays high-definition movies.',
  });

  // 3. Coffee Table
  const ctGroup = new THREE.Group();
  const ctTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 1.4), new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.5 }));
  ctTop.position.y = 0.8;
  ctGroup.add(ctTop);
  ctGroup.position.set(0, 0, -2.5);
  scene.add(ctGroup);
  manager.addInteractable(ctGroup, {
    id: 'coffee_table',
    word: 'Coffee Table',
    ipa: '/ˈkɒf.i ˌteɪ.bəl/',
    meaning: 'Bàn trà, bàn cà phê',
    example: 'There are cups of warm tea on the wooden coffee table.',
  });

  // 4. Floor Lamp
  const lampGroup = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
  pole.position.y = 1.6;
  lampGroup.add(pole);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.6, 12), new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 0.6
  }));
  shade.position.y = 3.2;
  lampGroup.add(shade);
  lampGroup.position.set(4.5, 0, -5);
  scene.add(lampGroup);
  manager.addInteractable(lampGroup, {
    id: 'lamp',
    word: 'Lamp',
    ipa: '/læmp/',
    meaning: 'Đèn sàn, đèn đứng',
    example: 'The stylish floor lamp casts a gentle warm glow.',
  });

  // 5. Carpet
  const carpetGroup = new THREE.Group();
  const carpetMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 4.0), new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.9 }));
  carpetMesh.rotation.x = -Math.PI / 2;
  carpetMesh.position.y = 0.02;
  carpetGroup.add(carpetMesh);
  carpetGroup.position.set(0, 0, -3.5);
  scene.add(carpetGroup);
  manager.addInteractable(carpetGroup, {
    id: 'carpet',
    word: 'Carpet',
    ipa: '/ˈkɑː.pɪt/',
    meaning: 'Thảm trải sàn',
    example: 'The emerald green carpet feels very soft under your feet.',
  });

  // 6. Painting
  const paintingGroup = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 0.1), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
  paintingGroup.add(frame);
  const canvasMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4), new THREE.MeshStandardMaterial({ color: 0x06b6d4 }));
  canvasMesh.position.z = 0.06;
  paintingGroup.add(canvasMesh);
  paintingGroup.position.set(-8, 3.0, -14);
  scene.add(paintingGroup);
  manager.addInteractable(paintingGroup, {
    id: 'painting',
    word: 'Painting',
    ipa: '/ˈpeɪn.tɪŋ/',
    meaning: 'Bức tranh',
    example: 'A modern art painting hangs gracefully on the wall.',
  });

  // 7. Wall Clock
  const clockGroup = new THREE.Group();
  const clockMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }));
  clockMesh.rotation.x = Math.PI / 2;
  clockGroup.add(clockMesh);
  clockGroup.position.set(8, 3.5, -14);
  scene.add(clockGroup);
  manager.addInteractable(clockGroup, {
    id: 'clock',
    word: 'Clock',
    ipa: '/klɒk/',
    meaning: 'Đồng hồ treo tường',
    example: 'The round clock on the wall ticks quietly.',
  });

  // 8. Guitar
  const guitarGroup = new THREE.Group();
  const gBody = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.2, 12), new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.5 }));
  gBody.position.y = 0.5;
  guitarGroup.add(gBody);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.08), new THREE.MeshStandardMaterial({ color: 0x451a03 }));
  neck.position.y = 1.2;
  guitarGroup.add(neck);
  guitarGroup.position.set(-4.5, 0, -5);
  guitarGroup.rotation.z = -0.15;
  scene.add(guitarGroup);
  manager.addInteractable(guitarGroup, {
    id: 'guitar',
    word: 'Guitar',
    ipa: '/ɡɪˈtɑːr/',
    meaning: 'Đàn ghi-ta',
    example: 'He loves playing acoustic guitar songs around the campfire.',
  });
}

/**
 * Builds Kitchen & Cafe thematic vocabulary items (Refrigerator, Oven, Coffee Cup, Teapot, Bread, Blender, Table, Toaster).
 */
export function createKitchenCafeInteractables(scene, manager) {
  // 1. Refrigerator
  const fridgeGroup = new THREE.Group();
  const fridgeMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.4, 1.4), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.3 }));
  fridgeMesh.position.y = 1.7;
  fridgeMesh.castShadow = true;
  fridgeGroup.add(fridgeMesh);
  fridgeGroup.position.set(-10, 0, -8);
  scene.add(fridgeGroup);
  manager.addInteractable(fridgeGroup, {
    id: 'refrigerator',
    word: 'Refrigerator',
    ipa: '/rɪˈfrɪdʒ.ər.eɪ.tər/',
    meaning: 'Tủ lạnh',
    example: 'Keep fresh vegetables and milk cold inside the refrigerator.',
  });

  // 2. Dining Table
  const tableGroup = new THREE.Group();
  const topMesh = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.16, 2.2), new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 }));
  topMesh.position.y = 1.35;
  topMesh.castShadow = true;
  tableGroup.add(topMesh);
  tableGroup.position.set(0, 0, -3);
  scene.add(tableGroup);
  manager.addInteractable(tableGroup, {
    id: 'dining_table',
    word: 'Dining Table',
    ipa: '/ˈdaɪ.nɪŋ ˌteɪ.bəl/',
    meaning: 'Bàn ăn',
    example: 'Delicious hot meals are served on the wooden dining table.',
  });

  // 3. Coffee Cup
  const cupGroup = new THREE.Group();
  const cupMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.24, 12), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 }));
  cupMesh.position.y = 1.48;
  cupGroup.add(cupMesh);
  cupGroup.position.set(-0.8, 0, -3.2);
  scene.add(cupGroup);
  manager.addInteractable(cupGroup, {
    id: 'coffee_cup',
    word: 'Coffee Cup',
    ipa: '/ˈkɒf.i kʌp/',
    meaning: 'Tách cà phê',
    example: 'A steaming cup of black coffee provides energy for work.',
  });

  // 4. Teapot
  const teapotGroup = new THREE.Group();
  const potMesh = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }));
  potMesh.position.y = 1.55;
  teapotGroup.add(potMesh);
  teapotGroup.position.set(0.8, 0, -3.2);
  scene.add(teapotGroup);
  manager.addInteractable(teapotGroup, {
    id: 'teapot',
    word: 'Teapot',
    ipa: '/ˈtiː.pɒt/',
    meaning: 'Ấm pha trà',
    example: 'Pour fragrant green tea from the ceramic teapot.',
  });

  // 5. Bread
  const breadGroup = new THREE.Group();
  const breadMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.5, 8, 8), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }));
  breadMesh.rotation.z = Math.PI / 2;
  breadMesh.position.y = 1.5;
  breadGroup.add(breadMesh);
  breadGroup.position.set(0, 0, -2.8);
  scene.add(breadGroup);
  manager.addInteractable(breadGroup, {
    id: 'bread',
    word: 'Bread',
    ipa: '/bred/',
    meaning: 'Bánh mì',
    example: 'Freshly baked artisan bread smells delightful.',
  });

  // 6. Blender
  const blenderGroup = new THREE.Group();
  const blenderMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.7, 10), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 }));
  blenderMesh.position.y = 1.75;
  blenderGroup.add(blenderMesh);
  blenderGroup.position.set(1.4, 0, -3.0);
  scene.add(blenderGroup);
  manager.addInteractable(blenderGroup, {
    id: 'blender',
    word: 'Blender',
    ipa: '/ˈblen.dər/',
    meaning: 'Máy xay sinh tố',
    example: 'Use the electric blender to make a healthy fruit smoothie.',
  });

  // 7. Microwave Oven
  const ovenGroup = new THREE.Group();
  const ovenMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.9), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 }));
  ovenMesh.position.y = 1.8;
  ovenGroup.add(ovenMesh);
  ovenGroup.position.set(8, 0, -8);
  scene.add(ovenGroup);
  manager.addInteractable(ovenGroup, {
    id: 'microwave',
    word: 'Microwave',
    ipa: '/ˈmaɪ.krə.weɪv/',
    meaning: 'Lò vi sóng',
    example: 'Warm up leftover soup inside the microwave.',
  });

  // 8. Toaster
  const toasterGroup = new THREE.Group();
  const toasterMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.4), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 }));
  toasterMesh.position.y = 1.55;
  toasterGroup.add(toasterMesh);
  toasterGroup.position.set(-1.4, 0, -3.0);
  scene.add(toasterGroup);
  manager.addInteractable(toasterGroup, {
    id: 'toaster',
    word: 'Toaster',
    ipa: '/ˈtəʊ.stər/',
    meaning: 'Máy nướng bánh mì',
    example: 'Insert two bread slices into the silver toaster for breakfast.',
  });
}

/**
 * Backward compatibility alias for single-room setup.
 */
export function createDefaultInteractables(scene, manager) {
  createStudyRoomInteractables(scene, manager);
}
