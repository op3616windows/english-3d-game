import * as THREE from 'three';

/**
 * Configuration definition for each zone / room in the game.
 */
export const ZONE_CONFIGS = {
  study_room: {
    id: 'study_room',
    name: 'Study Room',
    vietnameseName: 'Phòng học',
    description: 'Thư viện & Không gian học tập yên tĩnh',
    floorColor: 0x334155,
    wallColor: 0x1e293b,
    gridColor: 0x38bdf8,
    ambientColor: 0xffffff,
    ambientIntensity: 0.7,
    dirLightColor: 0xfffbeb,
    dirLightIntensity: 1.2,
    bounds: { width: 32, depth: 32 },
    spawnPos: { x: 0, y: 0, z: 6 },
    portals: [
      {
        targetZone: 'living_room',
        position: { x: 15.0, y: 0, z: 0 },
        rotationY: -Math.PI / 2,
        label: 'To Living Room ➔',
        color: 0x10b981
      }
    ]
  },
  living_room: {
    id: 'living_room',
    name: 'Living Room',
    vietnameseName: 'Phòng khách',
    description: 'Không gian sinh hoạt gia đình ấm cúng',
    floorColor: 0x3f3f46,
    wallColor: 0x18181b,
    gridColor: 0x34d399,
    ambientColor: 0xfef3c7,
    ambientIntensity: 0.8,
    dirLightColor: 0xfde68a,
    dirLightIntensity: 1.1,
    bounds: { width: 36, depth: 36 },
    spawnPos: { x: -14.0, y: 0, z: 0 },
    portals: [
      {
        targetZone: 'study_room',
        position: { x: -17.0, y: 0, z: 0 },
        rotationY: Math.PI / 2,
        label: 'To Study Room ➔',
        color: 0x38bdf8
      },
      {
        targetZone: 'kitchen_cafe',
        position: { x: 17.0, y: 0, z: 0 },
        rotationY: -Math.PI / 2,
        label: 'To Kitchen & Cafe ➔',
        color: 0xf59e0b
      }
    ]
  },
  kitchen_cafe: {
    id: 'kitchen_cafe',
    name: 'Kitchen & Cafe',
    vietnameseName: 'Nhà bếp & Quán cà phê',
    description: 'Không gian ẩm thực và đồ uống đa dạng',
    floorColor: 0x44403c,
    wallColor: 0x1c1917,
    gridColor: 0xfbbf24,
    ambientColor: 0xffedd5,
    ambientIntensity: 0.85,
    dirLightColor: 0xfed7aa,
    dirLightIntensity: 1.15,
    bounds: { width: 34, depth: 34 },
    spawnPos: { x: -14.0, y: 0, z: 0 },
    portals: [
      {
        targetZone: 'living_room',
        position: { x: -16.0, y: 0, z: 0 },
        rotationY: Math.PI / 2,
        label: 'To Living Room ➔',
        color: 0x10b981
      }
    ]
  }
};

/**
 * Manages multiple 3D scene zones, room geometry rendering, doorway portals,
 * smooth transition effects and WebGL resource disposal.
 */
export class ZoneManager {
  /**
   * @param {{ scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer }} sceneManager
   */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager?.scene || null;
    this.currentZoneId = 'study_room';
    this.isTransitioning = false;
    this.lastTransitionTime = 0;
    this.transitionCooldown = 1500; // 1.5 seconds debounce (E1)
    this.zoneChangeCallbacks = [];

    // Groups holding disposable room meshes and portals
    this.roomMeshGroup = new THREE.Group();
    this.portalsGroup = new THREE.Group();
    this.activePortalMeshes = [];

    if (this.scene) {
      this.scene.add(this.roomMeshGroup);
      this.scene.add(this.portalsGroup);
    }

    // Portal animation time tracker
    this.animTime = 0;

    // Create fade transition overlay DOM element if in browser
    this.initTransitionOverlay();

    // Initial build of study room
    if (this.scene) {
      this.buildZone(this.currentZoneId);
    }
  }

  /**
   * Initializes screen fade overlay element.
   */
  initTransitionOverlay() {
    if (typeof document === 'undefined') return;
    let overlay = document.getElementById('zone-transition-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'zone-transition-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = '#090d16';
      overlay.style.pointerEvents = 'none';
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.35s ease-in-out';
      overlay.style.zIndex = '99999';
      document.body.appendChild(overlay);
    }
    this.overlayElement = overlay;
  }

  /**
   * Returns current zone metadata.
   * @returns {{ id: string, name: string, vietnameseName: string, bounds: { width: number, depth: number }, spawnPos: { x: number, y: number, z: number } }}
   */
  getCurrentZone() {
    const config = ZONE_CONFIGS[this.currentZoneId] || ZONE_CONFIGS.study_room;
    return {
      id: config.id,
      name: config.name,
      vietnameseName: config.vietnameseName,
      description: config.description,
      bounds: { ...config.bounds },
      spawnPos: { ...config.spawnPos }
    };
  }

  /**
   * Registers a listener callback invoked whenever the zone changes.
   * @param {(zone: { id: string, name: string, vietnameseName: string }) => void} callback
   */
  onZoneChange(callback) {
    if (typeof callback === 'function') {
      this.zoneChangeCallbacks.push(callback);
    }
  }

  /**
   * Disposes all geometries, materials and textures in a given Three.js group (SC4).
   * @param {THREE.Group} group
   */
  disposeGroup(group) {
    if (!group) return;
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);

      obj.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) {
            child.geometry.dispose();
          }
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
  }

  /**
   * Builds 3D walls, floor and portal arches for the specified zone.
   * @param {string} zoneId
   */
  buildZone(zoneId) {
    const config = ZONE_CONFIGS[zoneId] || ZONE_CONFIGS.study_room;
    const { width, depth } = config.bounds;

    // 1. Dispose old room and portal meshes
    this.disposeGroup(this.roomMeshGroup);
    this.disposeGroup(this.portalsGroup);
    this.activePortalMeshes = [];

    // 2. Room Floor
    const floorGeo = new THREE.PlaneGeometry(width, depth);
    const floorMat = new THREE.MeshStandardMaterial({
      color: config.floorColor,
      roughness: 0.75,
      metalness: 0.15
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.roomMeshGroup.add(floor);

    // 3. Ambient Grid Lines
    const gridHelper = new THREE.GridHelper(Math.max(width, depth), 30, config.gridColor, 0x52525b);
    gridHelper.position.y = 0.01;
    this.roomMeshGroup.add(gridHelper);

    // 4. Perimeter Boundaries & Subtle Walls
    const wallHeight = 4.0;
    const wallThickness = 0.6;
    const wallMat = new THREE.MeshStandardMaterial({
      color: config.wallColor,
      roughness: 0.9,
      metalness: 0.1
    });

    // North & South walls
    const wallNSGeo = new THREE.BoxGeometry(width, wallHeight, wallThickness);
    const wallN = new THREE.Mesh(wallNSGeo, wallMat);
    wallN.position.set(0, wallHeight / 2, -depth / 2);
    const wallS = new THREE.Mesh(wallNSGeo, wallMat);
    wallS.position.set(0, wallHeight / 2, depth / 2);
    this.roomMeshGroup.add(wallN, wallS);

    // East & West walls
    const wallEWGeo = new THREE.BoxGeometry(wallThickness, wallHeight, depth);
    const wallE = new THREE.Mesh(wallEWGeo, wallMat);
    wallE.position.set(width / 2, wallHeight / 2, 0);
    const wallW = new THREE.Mesh(wallEWGeo, wallMat);
    wallW.position.set(-width / 2, wallHeight / 2, 0);
    this.roomMeshGroup.add(wallE, wallW);

    // Base trim border highlight
    const trimMat = new THREE.MeshBasicMaterial({ color: config.gridColor });
    const trimN = new THREE.Mesh(new THREE.BoxGeometry(width, 0.15, 0.15), trimMat);
    trimN.position.set(0, 0.08, -depth / 2 + 0.3);
    const trimS = new THREE.Mesh(new THREE.BoxGeometry(width, 0.15, 0.15), trimMat);
    trimS.position.set(0, 0.08, depth / 2 - 0.3);
    this.roomMeshGroup.add(trimN, trimS);

    // 5. Construct Door Portals
    if (config.portals && config.portals.length > 0) {
      config.portals.forEach((p) => {
        const portalObj = this.createPortalMesh(p);
        this.portalsGroup.add(portalObj);
        this.activePortalMeshes.push({
          config: p,
          mesh: portalObj,
          targetZone: p.targetZone
        });
      });
    }
  }

  /**
   * Creates a stylized 3D Doorway Portal mesh with glowing energy core.
   * @param {{ targetZone: string, position: { x: number, y: number, z: number }, rotationY?: number, label: string, color?: number }} portalDef
   * @returns {THREE.Group}
   */
  createPortalMesh(portalDef) {
    const portalGroup = new THREE.Group();
    portalGroup.position.set(portalDef.position.x, portalDef.position.y, portalDef.position.z);
    if (portalDef.rotationY) {
      portalGroup.rotation.y = portalDef.rotationY;
    }

    const themeColor = portalDef.color || 0x38bdf8;

    // Archway Columns
    const colGeo = new THREE.CylinderGeometry(0.25, 0.3, 3.2, 8);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.4 });
    const leftCol = new THREE.Mesh(colGeo, colMat);
    leftCol.position.set(-1.2, 1.6, 0);
    const rightCol = new THREE.Mesh(colGeo, colMat);
    rightCol.position.set(1.2, 1.6, 0);
    portalGroup.add(leftCol, rightCol);

    // Archway Top Beam
    const beamGeo = new THREE.BoxGeometry(2.8, 0.4, 0.6);
    const beam = new THREE.Mesh(beamGeo, colMat);
    beam.position.set(0, 3.3, 0);
    portalGroup.add(beam);

    // Glowing Archway Light strip
    const lightStripGeo = new THREE.BoxGeometry(2.4, 0.1, 0.1);
    const lightStripMat = new THREE.MeshBasicMaterial({ color: themeColor });
    const lightStrip = new THREE.Mesh(lightStripGeo, lightStripMat);
    lightStrip.position.set(0, 3.05, 0);
    portalGroup.add(lightStrip);

    // Swirling Energy Curtain
    const curtainGeo = new THREE.PlaneGeometry(2.1, 3.0);
    const curtainMat = new THREE.MeshStandardMaterial({
      color: themeColor,
      emissive: themeColor,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const curtain = new THREE.Mesh(curtainGeo, curtainMat);
    curtain.position.set(0, 1.5, 0);
    curtain.name = 'portal_curtain';
    portalGroup.add(curtain);

    // Base entry step
    const stepGeo = new THREE.BoxGeometry(2.6, 0.1, 1.0);
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const step = new THREE.Mesh(stepGeo, stepMat);
    step.position.set(0, 0.05, 0);
    portalGroup.add(step);

    return portalGroup;
  }

  /**
   * Checks if player position overlaps with any active portal in current zone.
   * Includes 1.5s debounce to prevent repeated transitions (E1, SC1).
   * @param {{ x: number, y: number, z: number }} playerPos
   * @returns {string | null} targetZone or null
   */
  checkPortalOverlap(playerPos) {
    if (!playerPos || this.isTransitioning) return null;

    const now = Date.now();
    if (now - this.lastTransitionTime < this.transitionCooldown) {
      return null;
    }

    const currentConfig = ZONE_CONFIGS[this.currentZoneId];
    if (!currentConfig || !currentConfig.portals) return null;

    for (const portal of currentConfig.portals) {
      const dx = playerPos.x - portal.position.x;
      const dz = playerPos.z - portal.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Trigger radius of portal (within 1.8 meters)
      if (dist < 1.8) {
        return portal.targetZone;
      }
    }

    return null;
  }

  /**
   * Switches to a new zone with a fade transition under 1 second (SC1, SC4).
   * @param {string} targetZoneId
   * @param {any} [characterController] - Optional character controller to reposition
   * @returns {Promise<boolean>}
   */
  async switchZone(targetZoneId, characterController = null) {
    if (this.isTransitioning) return false;
    if (!ZONE_CONFIGS[targetZoneId]) {
      console.warn(`[ZoneManager] Unknown zoneId: ${targetZoneId}`);
      return false;
    }
    if (targetZoneId === this.currentZoneId) return false;

    const now = Date.now();
    if (now - this.lastTransitionTime < this.transitionCooldown) {
      return false;
    }

    this.isTransitioning = true;
    this.lastTransitionTime = now;

    // Step 1: Fade out (screen turns black) ~250ms
    if (this.overlayElement) {
      this.overlayElement.style.opacity = '1';
    }
    await new Promise((resolve) => setTimeout(resolve, 280));

    // Step 2: Swap zone 3D assets & dispose old resources (SC4)
    this.currentZoneId = targetZoneId;
    this.buildZone(targetZoneId);

    const newConfig = ZONE_CONFIGS[targetZoneId];

    // Step 3: Reposition player to target room's spawn point
    if (characterController && typeof characterController.setPosition === 'function') {
      const spawn = newConfig.spawnPos;
      characterController.setPosition(spawn.x, spawn.y, spawn.z);
    }

    // Step 4: Notify listeners (e.g. interactable objects, minimap, HUD)
    const eventPayload = {
      id: newConfig.id,
      name: newConfig.name,
      vietnameseName: newConfig.vietnameseName,
      bounds: newConfig.bounds
    };
    this.zoneChangeCallbacks.forEach((cb) => {
      try {
        cb(eventPayload);
      } catch (err) {
        console.error('[ZoneManager] Error in onZoneChange callback:', err);
      }
    });

    // Step 5: Fade back in ~300ms (Total transition < 1s, satisfying SC1)
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (this.overlayElement) {
      this.overlayElement.style.opacity = '0';
    }
    await new Promise((resolve) => setTimeout(resolve, 320));

    this.isTransitioning = false;
    return true;
  }

  /**
   * Per-frame animation for active portals (pulsing energy glow).
   * @param {number} delta
   */
  update(delta) {
    this.animTime += delta || 0.016;
    if (this.activePortalMeshes.length > 0) {
      const pulse = 0.35 + 0.2 * Math.sin(this.animTime * 3.5);
      this.activePortalMeshes.forEach((item) => {
        const curtain = item.mesh.getObjectByName('portal_curtain');
        if (curtain && curtain.material) {
          curtain.material.opacity = pulse;
        }
      });
    }
  }
}
