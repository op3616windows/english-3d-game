import * as THREE from 'three';

/**
 * NPCController creates and manages the 3D NPC (Teacher Alex) with procedural waving animation.
 */
export class NPCController {
  /**
   * @param {THREE.Scene} scene
   * @param {{ x: number, y: number, z: number }} position
   */
  constructor(scene, position = { x: 3.5, y: 0, z: -2.0 }) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.animTime = 0;

    this._buildNPCMesh();
    this.group.position.set(position.x, position.y, position.z);
    // Face towards the player's initial entry area
    this.group.rotation.y = -Math.PI / 4;

    this.scene.add(this.group);
  }

  _buildNPCMesh() {
    // Materials
    const coatMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.5 }); // Indigo coat
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }); // Brown hair
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const glassesMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.05, 0.5);
    this.torso = new THREE.Mesh(torsoGeo, coatMat);
    this.torso.position.y = 1.35;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Head
    const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 2.2;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Hair
    const hairGeo = new THREE.BoxGeometry(0.66, 0.22, 0.66);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 2.52;
    this.group.add(hair);

    // Glasses
    const glassGeo = new THREE.BoxGeometry(0.5, 0.14, 0.08);
    const glasses = new THREE.Mesh(glassGeo, glassesMat);
    glasses.position.set(0, 2.22, -0.32);
    this.group.add(glasses);

    // Left Arm (relaxed at side)
    const armGeo = new THREE.BoxGeometry(0.24, 0.8, 0.24);
    this.leftArm = new THREE.Mesh(armGeo, coatMat);
    this.leftArm.position.set(-0.55, 1.3, 0);
    this.leftArm.castShadow = true;
    this.group.add(this.leftArm);

    // Right Arm Pivot & Arm (for waving animation)
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.55, 1.7, 0);

    this.rightArm = new THREE.Mesh(armGeo, coatMat);
    this.rightArm.position.set(0, -0.4, 0);
    this.rightArm.castShadow = true;
    this.rightArmPivot.add(this.rightArm);
    this.group.add(this.rightArmPivot);

    // Left Leg
    const legGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    this.leftLeg = new THREE.Mesh(legGeo, pantsMat);
    this.leftLeg.position.set(-0.25, 0.45, 0);
    this.leftLeg.castShadow = true;
    this.group.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Mesh(legGeo, pantsMat);
    this.rightLeg.position.set(0.25, 0.45, 0);
    this.rightLeg.castShadow = true;
    this.group.add(this.rightLeg);

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.32, 0.15, 0.4);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -0.4, -0.05);
    this.leftLeg.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, -0.4, -0.05);
    this.rightLeg.add(rightShoe);

    // Floating Name Tag Sprite / Canvas
    this._createFloatingLabel();
  }

  _createFloatingLabel() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Draw pill badge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect ? ctx.roundRect(8, 8, 240, 48, 24) : ctx.rect(8, 8, 240, 48);
    ctx.fill();

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎓 Teacher Alex', 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    this.labelSprite = new THREE.Sprite(spriteMat);
    this.labelSprite.position.set(0, 3.0, 0);
    this.labelSprite.scale.set(1.8, 0.45, 1);
    this.group.add(this.labelSprite);
  }

  /**
   * Updates procedural waving and breathing animations.
   * @param {number} delta
   */
  update(delta) {
    this.animTime += delta;

    // Friendly waving animation on right arm
    const wave = Math.sin(this.animTime * 3.5);
    this.rightArmPivot.rotation.z = -Math.PI / 1.5 + wave * 0.35;
    this.rightArmPivot.rotation.x = Math.sin(this.animTime * 1.5) * 0.15;

    // Subtle idle breathing
    const breath = Math.sin(this.animTime * 2.0) * 0.02;
    this.torso.position.y = 1.35 + breath;
    this.head.position.y = 2.2 + breath;
    if (this.labelSprite) {
      this.labelSprite.position.y = 3.0 + breath;
    }
  }

  getPosition() {
    return this.group.position;
  }

  getMesh() {
    return this.group;
  }

  dispose() {
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
