import BaseElement from './base-element.js';

export default class CpgSideScroller extends BaseElement {
  constructor() {
    super();
    this.createProps(CpgSideScroller.observedAttributes);
    this.configure({ fullScreen: true });

    // Sprite management
    this.sprites = {
      standing: [],
      walkingLeft: [],
      walkingRight: [],
      jumping: []
    };
    this.currentAnimation = 'standing';
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.animationSpeed = 8; // frames per animation cycle

    // Load sprites
    this.loadSprites();

    // Game state
    this.player = {
      x: 100,
      y: this.canvas.height - 100,
      width: 128, // Increased from 32 for larger character
      height: 128, // Increased from 32 for larger character
      velocityX: 0,
      velocityY: 0,
      onGround: true,
      color: '#FF6B6B'
    };

    this.gravity = 0.3;
    this.jumpForce = -8;
    this.moveSpeed = 3;
    this.friction = 0.8;

    // Ground level
    this.groundY = this.canvas.height - 50;

    // Simple platforms
    this.platforms = [
      { x: 200, y: this.groundY - 50, width: 100, height: 20, color: '#4ECDC4' },
      { x: 400, y: this.groundY - 100, width: 150, height: 20, color: '#45B7D1' },
      { x: 650, y: this.groundY - 80, width: 120, height: 20, color: '#96CEB4' }
    ];

    this.keys = {};

    this.setupEventListeners();
    // Don't start animation until sprites are loaded
  }

  async loadSprites() {
    const spriteTypes = ['standing', 'walking-left', 'walking-right', 'jumping'];
    const spriteKeys = ['standing', 'walkingLeft', 'walkingRight', 'jumping'];

    for (let i = 0; i < spriteTypes.length; i++) {
      const type = spriteTypes[i];
      const key = spriteKeys[i];

      for (let frame = 1; frame <= 10; frame++) {
        const img = new Image();
        const frameNumber = frame.toString().padStart(3, '0'); // 3-digit padding
        img.src = `/images/side-scroller/halfling-${type}-${frameNumber}.png`;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if image fails to load
        });
        this.sprites[key].push(img);
      }
    }

    // Start animation once sprites are loaded
    this.startAnimation();
  }

  static get observedAttributes() {
    return [];
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  update() {
    // Apply gravity first
    this.player.velocityY += this.gravity;

    // Update position
    this.player.x += this.player.velocityX;
    this.player.y += this.player.velocityY;

    // Reset ground state
    this.player.onGround = false;

    // Ground collision
    if (this.player.y + this.player.height >= this.groundY) {
      this.player.y = this.groundY - this.player.height;
      this.player.velocityY = 0;
      this.player.onGround = true;
    }

    // Platform collisions
    for (const platform of this.platforms) {
      if (this.player.x < platform.x + platform.width &&
          this.player.x + this.player.width > platform.x &&
          this.player.y < platform.y + platform.height &&
          this.player.y + this.player.height > platform.y) {

        // Landing on top of platform
        if (this.player.velocityY > 0 &&
            this.player.y < platform.y &&
            this.player.y + this.player.height > platform.y) {
          this.player.y = platform.y - this.player.height;
          this.player.velocityY = 0;
          this.player.onGround = true;
        }
      }
    }

    // Handle input after collision detection
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.player.velocityX = -this.moveSpeed;
    } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.player.velocityX = this.moveSpeed;
    } else {
      this.player.velocityX *= this.friction;
    }

    if ((this.keys['Space'] || this.keys['ArrowUp'] || this.keys['KeyW']) && this.player.onGround) {
      this.player.velocityY = this.jumpForce;
      this.player.onGround = false;
    }

    // Keep player in bounds
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x + this.player.width > this.canvas.width) {
      this.player.x = this.canvas.width - this.player.width;
    }

    // Update animation state
    this.updateAnimation();
  }

  updateAnimation() {
    // Determine animation state
    let newAnimation = 'standing';

    if (!this.player.onGround || this.player.velocityY < 0) {
      newAnimation = 'jumping';
    } else if (this.player.velocityX < -0.1) {
      newAnimation = 'walkingLeft';
    } else if (this.player.velocityX > 0.1) {
      newAnimation = 'walkingRight';
    }

    // Change animation if needed
    if (newAnimation !== this.currentAnimation) {
      this.currentAnimation = newAnimation;
      this.animationFrame = 0;
      this.animationTimer = 0;
    }

    // Update animation frame
    this.animationTimer++;
    if (this.animationTimer >= this.animationSpeed) {
      this.animationTimer = 0;
      this.animationFrame = (this.animationFrame + 1) % 10;
    }
  }

  draw() {
    const ctx = this.canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);

    // Draw platforms
    for (const platform of this.platforms) {
      ctx.fillStyle = platform.color;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    // Draw player sprite
    const currentSprite = this.sprites[this.currentAnimation][this.animationFrame];
    if (currentSprite && currentSprite.complete) {
      ctx.drawImage(currentSprite, this.player.x, this.player.y, this.player.width, this.player.height);
    } else {
      // Fallback to rectangle if sprite not loaded
      ctx.fillStyle = this.player.color;
      ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    }

    // Draw instructions
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '16px Arial';
    ctx.fillText('Use arrow keys to move, space to jump!', 20, 30);
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  startAnimation() {
    this.animate();
  }
}

// Register the custom element
customElements.define('cpg-side-scroller', CpgSideScroller);