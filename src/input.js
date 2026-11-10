/**
 * InputManager manages keyboard input for player movement (WASD and arrow keys).
 */
export class InputManager {
  constructor() {
    this.enabled = true;
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) {
      this.reset();
    }
  }

  reset() {
    this.keys.forward = false;
    this.keys.backward = false;
    this.keys.left = false;
    this.keys.right = false;
  }

  _onKeyDown(event) {
    if (!this.enabled) return;

    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
    }
  }

  _onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
    }
  }

  /**
   * Returns normalized movement vector on the X-Z plane.
   * @returns {{ x: number, z: number, isMoving: boolean }}
   */
  getMoveVector() {
    if (!this.enabled) {
      return { x: 0, z: 0, isMoving: false };
    }

    let x = 0;
    let z = 0;

    if (this.keys.forward) z -= 1;
    if (this.keys.backward) z += 1;
    if (this.keys.left) x -= 1;
    if (this.keys.right) x += 1;

    const length = Math.hypot(x, z);
    const isMoving = length > 0;

    if (isMoving) {
      x /= length;
      z /= length;
    }

    return { x, z, isMoving };
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}
