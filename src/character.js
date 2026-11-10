import * as THREE from 'three';

/**
 * CharacterController builds a 3D low-poly character, handles movement physics,
 * animation transitions (idle/walk), floor boundary constraints, and third-person camera follow.
 */
export class CharacterController {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.PerspectiveCamera} camera
   */
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.group = new THREE.Group();
    this.speed = 7.0; // units per second
    this.turnSpeed = 10.0;
    this.floorLimit = 18.5; // floor boundary constraint

    // Camera follow parameters
    this.cameraOffset = new THREE.Vector3(0, 4.5, 7.5);
    this.cameraLookOffset = new THREE.Vector3(0, 1.2, 0);

    // Animation state
    this.animTime = 0;
    this.isMoving = false;
    this.animWeight = 0; // 0 = idle, 1 = walk

    this._buildCharacterMesh();
    this.scene.add(this.group);
  }

  _buildCharacterMesh() {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.6 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.0, 0.5);
    this.torso = new THREE.Mesh(torsoGeo, bodyMat);
    this.torso.position.y = 1.3;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Head
    const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 2.15;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Visor / eyes
    const eyeGeo = new THREE.BoxGeometry(0.4, 0.15, 0.1);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const eyes = new THREE.Mesh(eyeGeo, eyeMat);
    eyes.position.set(0, 2.15, -0.31);
    this.group.add(eyes);

    // Left Arm
    const armGeo = new THREE.BoxGeometry(0.25, 0.8, 0.25);
    this.leftArm = new THREE.Mesh(armGeo, bodyMat);
    this.leftArm.position.set(-0.55, 1.25, 0);
    this.leftArm.castShadow = true;
    this.group.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Mesh(armGeo, bodyMat);
    this.rightArm.position.set(0.55, 1.25, 0);
    this.rightArm.castShadow = true;
    this.group.add(this.rightArm);

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

    // Initial position
    this.group.position.set(0, 0, 0);
  }

  /**
   * Updates character position, rotation, animation cycle, and camera.
   * @param {number} delta - Frame delta time in seconds.
   * @param {{ x: number, z: number, isMoving: boolean }} moveVector
   */
  update(delta, moveVector) {
    this.isMoving = moveVector.isMoving;

    // Smooth animation blend weight between idle (0) and walk (1)
    const targetWeight = this.isMoving ? 1.0 : 0.0;
    this.animWeight += (targetWeight - this.animWeight) * Math.min(delta * 10, 1.0);

    if (this.isMoving) {
      // Movement translation
      const moveDistance = this.speed * delta;
      this.group.position.x += moveVector.x * moveDistance;
      this.group.position.z += moveVector.z * moveDistance;

      // Floor boundary clamp (N2 prohibition)
      this.group.position.x = Math.max(-this.floorLimit, Math.min(this.floorLimit, this.group.position.x));
      this.group.position.z = Math.max(-this.floorLimit, Math.min(this.floorLimit, this.group.position.z));

      // Smooth rotation towards movement direction
      const targetRotation = Math.atan2(moveVector.x, moveVector.z) + Math.PI;
      let rotDiff = targetRotation - this.group.rotation.y;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      this.group.rotation.y += rotDiff * Math.min(delta * this.turnSpeed, 1.0);
    }

    // Procedural animation cycle (walk vs idle)
    this.animTime += delta * (this.isMoving ? 12 : 2.5);

    // Walking limbs swing
    const walkSwing = Math.sin(this.animTime) * 0.6 * this.animWeight;
    this.leftLeg.rotation.x = walkSwing;
    this.rightLeg.rotation.x = -walkSwing;
    this.leftArm.rotation.x = -walkSwing * 0.8;
    this.rightArm.rotation.x = walkSwing * 0.8;

    // Subtle idle breathing & bobbing
    const idleBob = Math.sin(this.animTime * 1.5) * 0.03 * (1 - this.animWeight);
    const walkBob = Math.abs(Math.sin(this.animTime)) * 0.05 * this.animWeight;
    this.torso.position.y = 1.3 + idleBob + walkBob;
    this.head.position.y = 2.15 + idleBob + walkBob;

    // Third-person camera follow
    this._updateCamera(delta);
  }

  _updateCamera(delta) {
    const idealPosition = new THREE.Vector3()
      .copy(this.group.position)
      .add(this.cameraOffset);

    // Smooth camera lerp
    this.camera.position.lerp(idealPosition, Math.min(delta * 5.0, 1.0));

    const targetLookAt = new THREE.Vector3()
      .copy(this.group.position)
      .add(this.cameraLookOffset);

    this.camera.lookAt(targetLookAt);
  }

  getPosition() {
    return this.group.position;
  }
}
