import BaseElement from './base-element.js';

const FRAME_COUNT = 30; // Number of frames per animation cycle

// Player configuration - easily adjustable stats
const PLAYER_CONFIG = {
  // Visual properties
  width: 128,
  height: 128,
  color: '#FF6B6B',
  
  // Physics properties
  gravity: 0.3,
  jumpForce: -8,
  moveSpeed: 2.25,
  friction: 0.8,
  
  // Animation properties
  animationSpeed: 4.25, // frames per animation cycle
  
  // Starting position offset from bottom
  startOffsetY: 100
};

export default class CpgSideScroller extends BaseElement {
  constructor() {
    super();
    this.createProps(CpgSideScroller.observedAttributes);
    this.configure({ fullScreen: true });

    // Loading state
    this.isLoading = true;
    this.loadingProgress = 0;
    this.totalSprites = FRAME_COUNT * 4; // 30 frames × 4 animations
    this.loadedSprites = 0;

    // Background image
    this.backgroundImage = null;

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
    this.animationSpeed = PLAYER_CONFIG.animationSpeed; // frames per animation cycle

    // Jump animation tracking
    this.isJumping = false;
    this.jumpStartTime = 0;
    this.jumpAnimationFrame = 0;

    // Load sprites
    this.loadSprites();

    // Game state
    this.player = {
      x: 100,
      y: this.canvas.height - PLAYER_CONFIG.startOffsetY,
      width: PLAYER_CONFIG.width,
      height: PLAYER_CONFIG.height,
      velocityX: 0,
      velocityY: 0,
      onGround: true,
      color: PLAYER_CONFIG.color
    };

    this.gravity = PLAYER_CONFIG.gravity;
    this.jumpForce = PLAYER_CONFIG.jumpForce;
    this.moveSpeed = PLAYER_CONFIG.moveSpeed;
    this.friction = PLAYER_CONFIG.friction;

    // Ground level
    this.groundY = this.canvas.height - 50;

    // Simple platforms
    this.platforms = [
      { x: 200, y: this.groundY - 50, width: 100, height: 20, color: '#884800ff' },
      { x: 400, y: this.groundY - 100, width: 150, height: 20, color: '#884800ff' },
      { x: 650, y: this.groundY - 80, width: 120, height: 20, color: '#884800ff' }
    ];

    this.keys = {};

    this.setupEventListeners();
    // Start animation immediately to show loading screen
    this.startAnimation();
  }

  async loadSprites() {
    // Load background image first
    this.backgroundImage = new Image();
    await new Promise((resolve) => {
      this.backgroundImage.onload = resolve;
      this.backgroundImage.onerror = resolve; // Continue even if image fails to load
      this.backgroundImage.src = '/images/side-scroller/background-1.png';
    });

    const spriteTypes = ['standing', 'walking-left', 'walking-right', 'jumping'];
    const spriteKeys = ['standing', 'walkingLeft', 'walkingRight', 'jumping'];

    for (let i = 0; i < spriteTypes.length; i++) {
      const type = spriteTypes[i];
      const key = spriteKeys[i];

      for (let frame = 1; frame <= FRAME_COUNT; frame++) {
        const img = new Image();
        const frameNumber = frame.toString().padStart(3, '0'); // 3-digit padding
        img.src = `/images/side-scroller/halfling-${type}-${frameNumber}.png`;
        
        await new Promise((resolve) => {
          img.onload = () => {
            this.loadedSprites++;
            this.loadingProgress = (this.loadedSprites / this.totalSprites) * 100;
            resolve();
          };
          img.onerror = () => {
            this.loadedSprites++;
            this.loadingProgress = (this.loadedSprites / this.totalSprites) * 100;
            resolve(); // Continue even if image fails to load
          };
        });
        
        this.sprites[key].push(img);
      }
    }

    // Mark loading as complete
    this.isLoading = false;
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
      // Start jump animation tracking
      this.isJumping = true;
      this.jumpStartTime = Date.now();
      this.jumpAnimationFrame = 0;
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

    if (!this.player.onGround) {
      newAnimation = 'jumping';
    } else if (this.player.velocityX < -0.1) {
      newAnimation = 'walkingLeft';
    } else if (this.player.velocityX > 0.1) {
      newAnimation = 'walkingRight';
    }

    // Special handling for jump animation
    if (newAnimation === 'jumping') {
      if (!this.isJumping) {
        // Starting a new jump
        this.isJumping = true;
        this.jumpStartTime = Date.now();
        this.jumpAnimationFrame = 0;
      }
      
      // Advance animation frame based on time elapsed
      // Estimate jump takes ~800ms, map to 30 frames
      const elapsed = Date.now() - this.jumpStartTime;
      const frameDuration = 800 / FRAME_COUNT; // ms per frame
      const targetFrame = Math.floor(elapsed / frameDuration);
      
      this.animationFrame = Math.min(targetFrame, FRAME_COUNT - 1);
    } else {
      // Reset jump tracking when not jumping
      if (this.isJumping) {
        this.isJumping = false;
        this.jumpAnimationFrame = 0;
      }
      
      // Regular animation logic for non-jumping states
      if (newAnimation !== this.currentAnimation) {
        this.currentAnimation = newAnimation;
        this.animationFrame = 0;
        this.animationTimer = 0;
      }

      // Update animation frame for walking/standing
      this.animationTimer++;
      if (this.animationTimer >= this.animationSpeed) {
        this.animationTimer = 0;
        this.animationFrame = (this.animationFrame + 1) % FRAME_COUNT;
      }
    }

    this.currentAnimation = newAnimation;
  }

  draw() {
    const ctx = this.canvas.getContext('2d');

    if (this.isLoading) {
      // Draw loading screen
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Loading text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Loading Sprites...', this.canvas.width / 2, this.canvas.height / 2 - 50);

      // Progress bar background
      const barWidth = 400;
      const barHeight = 30;
      const barX = (this.canvas.width - barWidth) / 2;
      const barY = this.canvas.height / 2;

      ctx.fillStyle = '#333333';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Progress bar fill
      ctx.fillStyle = '#4ECDC4';
      const fillWidth = (this.loadingProgress / 100) * barWidth;
      ctx.fillRect(barX, barY, fillWidth, barHeight);

      // Progress text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`${Math.round(this.loadingProgress)}%`, this.canvas.width / 2, barY + barHeight + 40);

      // Instructions
      ctx.font = '18px Arial';
      ctx.fillText('Preparing your halfling adventure...', this.canvas.width / 2, barY + barHeight + 80);

      return;
    }

    // Draw background image
    if (this.backgroundImage && this.backgroundImage.complete) {
      // Scale background to fit canvas while maintaining aspect ratio
      const bgAspectRatio = this.backgroundImage.width / this.backgroundImage.height;
      const canvasAspectRatio = this.canvas.width / this.canvas.height;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (bgAspectRatio > canvasAspectRatio) {
        // Background is wider than canvas aspect ratio
        drawHeight = this.canvas.height;
        drawWidth = drawHeight * bgAspectRatio;
        drawX = (this.canvas.width - drawWidth) / 2;
        drawY = 0;
      } else {
        // Background is taller than canvas aspect ratio
        drawWidth = this.canvas.width;
        drawHeight = drawWidth / bgAspectRatio;
        drawX = 0;
        drawY = (this.canvas.height - drawHeight) / 2;
      }
      
      ctx.drawImage(this.backgroundImage, drawX, drawY, drawWidth, drawHeight);
    } else {
      // Fallback to solid color if background image not loaded
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

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
    if (!this.isLoading) {
      this.update();
    }
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  startAnimation() {
    this.animate();
  }
}

// Register the custom element
customElements.define('cpg-side-scroller', CpgSideScroller);