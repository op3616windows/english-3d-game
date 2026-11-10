import { ZONE_CONFIGS } from './zoneManager.js';

/**
 * 2D Canvas Minimap component displaying the current room layout,
 * doorways/portals, and real-time player position & orientation.
 */
export class Minimap {
  /**
   * @param {HTMLElement} parentContainer - DOM container for HUD overlay
   * @param {any} zoneManager - Active ZoneManager instance
   * @param {any} characterController - Active CharacterController instance
   */
  constructor(parentContainer, zoneManager, characterController) {
    this.parentContainer = parentContainer || document.body;
    this.zoneManager = zoneManager;
    this.characterController = characterController;

    this.canvasSize = 140; // width & height in px
    this.padding = 12;

    this._initDOM();

    // Listen to zone change events to update title and bounds
    if (this.zoneManager && typeof this.zoneManager.onZoneChange === 'function') {
      this.zoneManager.onZoneChange((zone) => {
        this.updateZoneHeader(zone);
        this.showZoneBanner(zone);
      });
    }

    const current = this.zoneManager?.getCurrentZone();
    if (current) {
      this.updateZoneHeader(current);
    }
  }

  _initDOM() {
    if (typeof document === 'undefined') return;

    // Minimap widget container
    let container = document.getElementById('minimap-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'minimap-container';
      container.className = 'minimap-widget';
      this.parentContainer.appendChild(container);
    }
    this.container = container;

    // Header label
    let titleEl = document.getElementById('minimap-title');
    if (!titleEl) {
      titleEl = document.createElement('div');
      titleEl.id = 'minimap-title';
      titleEl.className = 'minimap-header';
      titleEl.innerHTML = '<span class="minimap-icon">🧭</span> <span id="minimap-zone-name">Study Room</span>';
      this.container.appendChild(titleEl);
    }
    this.titleElement = titleEl;
    this.zoneNameSpan = document.getElementById('minimap-zone-name');

    // Canvas element
    let canvas = document.getElementById('minimap-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'minimap-canvas';
      canvas.width = this.canvasSize;
      canvas.height = this.canvasSize;
      this.container.appendChild(canvas);
    }
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // HUD Zone Banner (shown briefly when entering a new room)
    let banner = document.getElementById('hud-zone-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'hud-zone-banner';
      banner.className = 'hud-zone-banner';
      banner.style.display = 'none';
      this.parentContainer.appendChild(banner);
    }
    this.zoneBannerElement = banner;
  }

  /**
   * Updates the Minimap header with current zone name.
   * @param {{ id: string, name: string, vietnameseName?: string }} zone
   */
  updateZoneHeader(zone) {
    if (this.zoneNameSpan) {
      this.zoneNameSpan.textContent = zone.name || 'Room';
    }
  }

  /**
   * Displays an elegant HUD banner notification when entering a new zone (SC3).
   * @param {{ id: string, name: string, vietnameseName?: string, description?: string }} zone
   */
  showZoneBanner(zone) {
    if (!this.zoneBannerElement) return;

    this.zoneBannerElement.innerHTML = `
      <div class="zone-banner-title">📍 ${zone.name}</div>
      <div class="zone-banner-subtitle">${zone.vietnameseName || ''}</div>
    `;

    this.zoneBannerElement.style.display = 'flex';
    this.zoneBannerElement.classList.remove('fade-out');
    this.zoneBannerElement.classList.add('fade-in');

    if (this.bannerTimeout) {
      clearTimeout(this.bannerTimeout);
    }

    this.bannerTimeout = setTimeout(() => {
      this.zoneBannerElement.classList.remove('fade-in');
      this.zoneBannerElement.classList.add('fade-out');
      setTimeout(() => {
        if (this.zoneBannerElement) {
          this.zoneBannerElement.style.display = 'none';
        }
      }, 500);
    }, 2800);
  }

  /**
   * Renders real-time minimap frame (player position, room bounds, portals).
   */
  update() {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const w = this.canvasSize;
    const h = this.canvasSize;

    // Clear background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, 0, w, h);

    const zone = this.zoneManager?.getCurrentZone();
    const config = zone ? ZONE_CONFIGS[zone.id] : null;
    const bounds = config?.bounds || { width: 32, depth: 32 };

    const drawW = w - this.padding * 2;
    const drawH = h - this.padding * 2;
    const scaleX = drawW / bounds.width;
    const scaleZ = drawH / bounds.depth;

    // Room boundaries outline
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.padding, this.padding, drawW, drawH);

    // Inner subtle grid lines
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, this.padding);
    ctx.lineTo(w / 2, h - this.padding);
    ctx.moveTo(this.padding, h / 2);
    ctx.lineTo(w - this.padding, h / 2);
    ctx.stroke();

    // World coordinate to Minimap coordinate conversion
    const toMapX = (worldX) => this.padding + (worldX + bounds.width / 2) * scaleX;
    const toMapY = (worldZ) => this.padding + (worldZ + bounds.depth / 2) * scaleZ;

    // Draw Portals on minimap
    if (config?.portals) {
      config.portals.forEach((p) => {
        const mx = toMapX(p.position.x);
        const my = toMapY(p.position.z);

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Draw Player marker and facing angle
    if (this.characterController) {
      const playerPos = this.characterController.getPosition
        ? this.characterController.getPosition()
        : { x: 0, z: 0 };

      const px = Math.min(Math.max(toMapX(playerPos.x), this.padding), w - this.padding);
      const py = Math.min(Math.max(toMapY(playerPos.z), this.padding), h - this.padding);

      // Player rotation
      const rotationY = this.characterController.model?.rotation?.y || 0;

      // Draw view cone / heading direction
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-rotationY + Math.PI);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 14, -Math.PI / 4, Math.PI / 4);
      ctx.closePath();
      ctx.fill();

      // Player dot
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }
  }
}
