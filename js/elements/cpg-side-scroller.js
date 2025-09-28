import BaseElement from './base-element.js';

// Player configuration - easily adjustable stats
const PLAYER_CONFIG = {
  // Visual properties
  width: 128,
  height: 128,
  color: '#FF6B6B',
  
  // Physics properties
  gravity: 0.3,
  jumpForce: -8,
  moveSpeed: 3,
  friction: 0.8,
  
  // Animation properties
  animationSpeed: 8, // frames per animation cycle
  
  // Starting position offset from bottom
  startOffsetY: 100,

  // Health properties
  maxHealth: 100,
  attackDamage: 25,
  attackRange: 150, // Increased from 50 to allow attacking with collision detection
  attackCooldown: 500 // ms between attacks (0.5 seconds)
};

// Enemy configuration
const ENEMY_CONFIG = {
  width: 128,
  height: 128,
  color: '#8B0000',
  moveSpeed: 1.5,
  maxHealth: 50,
  attackDamage: 15,
  attackRange: 150, // Increased from 40 to match player range
  detectionRange: 300, // Distance at which enemy starts chasing player
  attackCooldown: 1000 // ms between attacks
};

export default class CpgSideScroller extends BaseElement {
  constructor() {
    super();
    this.createProps(CpgSideScroller.observedAttributes);
    this.configure({ fullScreen: true });

    // Loading state
    this.isLoading = true;
    this.loadingProgress = 0;
    this.totalSprites = 0; // Will be calculated from animationConfigs
    this.loadedSprites = 0;

    // Background image
    this.backgroundImage = null;

    // Enemy sprite
    this.enemyImage = null;

    // Enemy sprite management
    this.enemySprites = {
      standing: [],
      walkingLeft: [],
      walkingRight: [],
      jumping: [],
      attackLeft: [],
      attackRight: []
    };

    // Sprite management
    this.sprites = {
      standing: [],
      walkingLeft: [],
      walkingRight: [],
      jumping: [],
      attackLeft: [],
      attackRight: []
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
      color: PLAYER_CONFIG.color,
      health: PLAYER_CONFIG.maxHealth,
      lastAttackTime: 0,
      isAttacking: false,
      attackStartTime: 0,
      attackDirection: 'right' // 'left' or 'right'
    };

    // Enemy management
    this.enemies = [];

    // Game state
    this.gameOver = false;

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

    // Load enemy image
    this.enemyImage = new Image();
    await new Promise((resolve) => {
      this.enemyImage.onload = resolve;
      this.enemyImage.onerror = resolve; // Continue even if image fails to load
      this.enemyImage.src = '/images/side-scroller/orc-001.png';
    });

    // Load enemy sprites for all animation types
    const animationConfigs = [
      { type: 'standing', frameCount: 30 },
      { type: 'walking-left', frameCount: 30 }, 
      { type: 'walking-right', frameCount: 30 },
      { type: 'jumping', frameCount: 30 },
      { type: 'attack-left', frameCount: 30 },
      { type: 'attack-right', frameCount: 30 }
    ];

    // Calculate total sprites needed
    this.totalSprites = animationConfigs.reduce((total, config) => total + config.frameCount, 0) * 2; // × 2 for halfling + orc

    // Helper function to convert dash-case to camelCase
    const toCamelCase = (str) => {
      return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    };

    // Method to get frame count for an animation type
    this.getFrameCount = (animationType) => {
      const config = animationConfigs.find(config => toCamelCase(config.type) === animationType);
      return config ? config.frameCount : 30; // Default to 30 if not found
    };

    for (const config of animationConfigs) {
      const key = toCamelCase(config.type);
      for (let frame = 1; frame <= config.frameCount; frame++) {
        const img = new Image();
        const frameNumber = frame.toString().padStart(3, '0'); // 3-digit padding
        img.src = `/images/side-scroller/orc-${config.type}-${frameNumber}.png`;
        
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if image fails to load
        });
        
        this.enemySprites[key].push(img);
      }
    }

    for (const config of animationConfigs) {
      const key = toCamelCase(config.type);
      for (let frame = 1; frame <= config.frameCount; frame++) {
        const img = new Image();
        const frameNumber = frame.toString().padStart(3, '0'); // 3-digit padding
        img.src = `/images/side-scroller/halfling-${config.type}-${frameNumber}.png`;
        
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

    // Mark loading as complete and spawn initial enemies
    this.isLoading = false;
    this.spawnEnemies();
  }

  static get observedAttributes() {
    return [];
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      
      // Handle restart
      if (e.code === 'KeyR' && this.gameOver) {
        this.restartGame();
      }
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

    // Character collisions - prevent player from moving through enemies (only when at similar heights and not in combat)
    for (const enemy of this.enemies) {
      // Check if characters are at similar vertical heights (within 20 pixels)
      const verticalOverlap = Math.abs((this.player.y + this.player.height/2) - (enemy.y + enemy.height/2)) < 20;
      
      // Check if characters are in combat range (don't push apart if they can attack each other)
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const inCombatRange = distance < Math.max(PLAYER_CONFIG.attackRange, ENEMY_CONFIG.attackRange);
      
      if (verticalOverlap && !inCombatRange && this.checkCollision(this.player, enemy)) {
        // Calculate overlap on each axis
        const overlapX = Math.min(this.player.x + this.player.width - enemy.x, enemy.x + enemy.width - this.player.x);
        const overlapY = Math.min(this.player.y + this.player.height - enemy.y, enemy.y + enemy.height - this.player.y);
        
        // Resolve collision by moving the smaller overlap
        if (overlapX < overlapY) {
          // Horizontal collision - separate on X axis
          if (this.player.x < enemy.x) {
            // Player is to the left of enemy
            this.player.x = enemy.x - this.player.width;
          } else {
            // Player is to the right of enemy
            this.player.x = enemy.x + enemy.width;
          }
        } else {
          // Vertical collision - separate on Y axis
          if (this.player.y < enemy.y) {
            // Player is above enemy
            this.player.y = enemy.y - this.player.height;
            this.player.velocityY = 0;
            this.player.onGround = true;
          } else {
            // Player is below enemy
            this.player.y = enemy.y + enemy.height;
            this.player.velocityY = 0;
          }
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

    if ((this.keys['ArrowUp'] || this.keys['KeyW']) && this.player.onGround) {
      this.player.velocityY = this.jumpForce;
      this.player.onGround = false;
      // Start jump animation tracking
      this.isJumping = true;
      this.jumpStartTime = Date.now();
      this.jumpAnimationFrame = 0;
    }

    // Handle attack input
    if (this.keys['Space'] && !this.player.isAttacking) {
      const now = Date.now();
      if (now - this.player.lastAttackTime > PLAYER_CONFIG.attackCooldown) {
        // Determine attack direction based on movement
        if (this.player.velocityX > 0.1) {
          this.player.attackDirection = 'right';
        } else if (this.player.velocityX < -0.1) {
          this.player.attackDirection = 'left';
        } else {
          this.player.attackDirection = 'right'; // Default to right when standing still
        }
        
        this.player.isAttacking = true;
        this.player.attackStartTime = now;
        this.player.lastAttackTime = now;
        
        // Attack nearby enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
          const enemy = this.enemies[i];
          const dx = enemy.x - this.player.x;
          const dy = enemy.y - this.player.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < PLAYER_CONFIG.attackRange) {
            enemy.health -= PLAYER_CONFIG.attackDamage;
            console.log(`Player attacked! Enemy health: ${enemy.health}`);
            
            // Remove enemy if health <= 0
            if (enemy.health <= 0) {
              this.enemies.splice(i, 1);
              console.log('Enemy defeated!');
            }
          }
        }
      }
    }
    // Enemy AI and combat
    this.updateEnemies();

    // Keep player in bounds
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x + this.player.width > this.canvas.width) {
      this.player.x = this.canvas.width - this.player.width;
    }

    // Update animation state
    this.updateAnimation();

    // Check for game over
    if (this.player.health <= 0) {
      this.gameOver = true;
    }
  }

  updateAnimation() {
    // Determine animation state - attack takes priority
    let newAnimation = 'standing';

    if (this.player.isAttacking) {
      // Check if attack animation should end (after 500ms)
      const attackElapsed = Date.now() - this.player.attackStartTime;
      if (attackElapsed >= 500) {
        this.player.isAttacking = false;
        this.animationFrame = 0;
      } else {
        const attackAnimation = this.player.attackDirection === 'left' ? 'attackLeft' : 'attackRight';
        newAnimation = attackAnimation;
        // Cycle through all 30 frames over 500ms
        const frameCount = this.getFrameCount(attackAnimation);
        const frameDuration = 500 / frameCount; // ms per frame
        const targetFrame = Math.floor(attackElapsed / frameDuration);
        this.animationFrame = Math.min(targetFrame, frameCount - 1);
      }
    } else if (!this.player.onGround) {
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
      // Estimate jump takes ~800ms, map to frames
      const elapsed = Date.now() - this.jumpStartTime;
      const frameCount = this.getFrameCount('jumping');
      const frameDuration = 800 / frameCount; // ms per frame
      const targetFrame = Math.floor(elapsed / frameDuration);
      
      this.animationFrame = Math.min(targetFrame, frameCount - 1);
    } else if (newAnimation !== 'attackLeft' && newAnimation !== 'attackRight') {
      // Reset jump tracking when not jumping
      if (this.isJumping) {
        this.isJumping = false;
        this.jumpAnimationFrame = 0;
      }
      
      // Regular animation logic for non-jumping, non-attacking states
      if (newAnimation !== this.currentAnimation) {
        this.currentAnimation = newAnimation;
        this.animationFrame = 0;
        this.animationTimer = 0;
      }

      // Update animation frame for walking/standing
      this.animationTimer++;
      if (this.animationTimer >= this.animationSpeed) {
        this.animationTimer = 0;
        const frameCount = this.getFrameCount(this.currentAnimation);
        this.animationFrame = (this.animationFrame + 1) % frameCount;
      }
    }

    this.currentAnimation = newAnimation;
  }

  drawHealthBar(ctx, x, y, width, height, currentHealth, maxHealth) {
    // Health bar background
    ctx.fillStyle = '#333333';
    ctx.fillRect(x, y, width, height);
    
    // Health bar fill
    const healthPercent = currentHealth / maxHealth;
    const healthWidth = width * healthPercent;
    
    // Color based on health percentage
    if (healthPercent > 0.6) {
      ctx.fillStyle = '#4CAF50'; // Green
    } else if (healthPercent > 0.3) {
      ctx.fillStyle = '#FF9800'; // Orange
    } else {
      ctx.fillStyle = '#F44336'; // Red
    }
    
    ctx.fillRect(x, y, healthWidth, height);
    
    // Health bar border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
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

    // Draw enemies
    for (const enemy of this.enemies) {
      // Draw enemy sprite with animation
      const currentEnemySprite = this.enemySprites[enemy.currentAnimation][enemy.animationFrame];
      if (currentEnemySprite && currentEnemySprite.complete) {
        ctx.drawImage(currentEnemySprite, enemy.x, enemy.y, enemy.width, enemy.height);
      } else {
        // Fallback to static enemy image or rectangle
        if (this.enemyImage && this.enemyImage.complete) {
          ctx.drawImage(this.enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
          ctx.fillStyle = enemy.color;
          ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
      }
      
      // Draw enemy health bar
      this.drawHealthBar(ctx, enemy.x, enemy.y - 20, enemy.width, 8, enemy.health, ENEMY_CONFIG.maxHealth);
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

    // Draw player health bar
    this.drawHealthBar(ctx, this.player.x, this.player.y - 20, this.player.width, 10, this.player.health, PLAYER_CONFIG.maxHealth);

    // Draw instructions
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '16px Arial';
    ctx.fillText('Use arrow keys to move, W/↑ to jump, space to attack!', 20, 30);

    // Draw game over screen
    if (this.gameOver) {
      // Semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Game over text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
      
      // Restart instructions
      ctx.font = '24px Arial';
      ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 20);
      
      ctx.textAlign = 'left'; // Reset text alignment
    }
  }

  animate() {
    if (!this.isLoading) {
      if (!this.gameOver) {
        this.update();
      }
    }
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  startAnimation() {
    this.animate();
  }

  spawnEnemies() {
    // Spawn a few enemies at different positions
    this.enemies = [
      {
        x: 600,
        y: this.groundY - ENEMY_CONFIG.height,
        width: ENEMY_CONFIG.width,
        height: ENEMY_CONFIG.height,
        velocityX: 0,
        velocityY: 0,
        health: ENEMY_CONFIG.maxHealth,
        lastAttackTime: 0,
        color: ENEMY_CONFIG.color,
        currentAnimation: 'standing',
        animationFrame: 0,
        animationTimer: 0
      },
      {
        x: 900,
        y: this.groundY - ENEMY_CONFIG.height,
        width: ENEMY_CONFIG.width,
        height: ENEMY_CONFIG.height,
        velocityX: 0,
        velocityY: 0,
        health: ENEMY_CONFIG.maxHealth,
        lastAttackTime: 0,
        color: ENEMY_CONFIG.color,
        currentAnimation: 'standing',
        animationFrame: 0,
        animationTimer: 0
      }
    ];
  }

  // Helper function to check collision between two rectangles
  checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  updateEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Calculate distance to player
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check if enemy and player are at similar vertical heights (within 50 pixels)
      const verticalProximity = Math.abs((this.player.y + this.player.height/2) - (enemy.y + enemy.height/2)) < 50;
      
      // Store previous animation for change detection
      const prevAnimation = this.enemyCurrentAnimation;
      
      // Move towards player if within detection range AND at similar height
      if (distance < ENEMY_CONFIG.detectionRange && verticalProximity) {
        if (Math.abs(dx) > 5) { // Only move if not too close
          enemy.velocityX = (dx > 0) ? ENEMY_CONFIG.moveSpeed : -ENEMY_CONFIG.moveSpeed;
        } else {
          enemy.velocityX *= 0.8; // Slow down when close
        }
      } else {
        enemy.velocityX *= 0.9; // Slow down when player is far or at different height
      }
      
      // Apply gravity to enemies
      enemy.velocityY += this.gravity;
      
      // Update enemy position
      enemy.x += enemy.velocityX;
      enemy.y += enemy.velocityY;
      
      // Ground collision for enemies
      if (enemy.y + enemy.height >= this.groundY) {
        enemy.y = this.groundY - enemy.height;
        enemy.velocityY = 0;
      }
      
      // Platform collisions for enemies
      for (const platform of this.platforms) {
        if (enemy.x < platform.x + platform.width &&
            enemy.x + enemy.width > platform.x &&
            enemy.y < platform.y + platform.height &&
            enemy.y + enemy.height > platform.y) {
          
          // Landing on top of platform
          if (enemy.velocityY > 0 &&
              enemy.y < platform.y &&
              enemy.y + enemy.height > platform.y) {
            enemy.y = platform.y - enemy.height;
            enemy.velocityY = 0;
          }
        }
      }
      
      // Enemy-to-enemy collision (only when at similar heights and not in combat)
      for (let j = 0; j < this.enemies.length; j++) {
        if (i !== j) { // Don't check collision with self
          const otherEnemy = this.enemies[j];
          // Check if enemies are at similar vertical heights (within 20 pixels)
          const verticalOverlap = Math.abs((enemy.y + enemy.height/2) - (otherEnemy.y + otherEnemy.height/2)) < 20;
          
          // Check if enemies are in combat range (don't push apart if they can attack each other)
          const dx = otherEnemy.x - enemy.x;
          const dy = otherEnemy.y - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const inCombatRange = distance < ENEMY_CONFIG.attackRange;
          
          if (verticalOverlap && !inCombatRange && this.checkCollision(enemy, otherEnemy)) {
            // Calculate overlap on each axis
            const overlapX = Math.min(enemy.x + enemy.width - otherEnemy.x, otherEnemy.x + otherEnemy.width - enemy.x);
            const overlapY = Math.min(enemy.y + enemy.height - otherEnemy.y, otherEnemy.y + otherEnemy.height - enemy.y);
            
            // Resolve collision by moving the smaller overlap
            if (overlapX < overlapY) {
              // Horizontal collision - separate on X axis
              if (enemy.x < otherEnemy.x) {
                // Enemy is to the left of other enemy
                enemy.x = otherEnemy.x - enemy.width;
              } else {
                // Enemy is to the right of other enemy
                enemy.x = otherEnemy.x + otherEnemy.width;
              }
            } else {
              // Vertical collision - separate on Y axis
              if (enemy.y < otherEnemy.y) {
                // Enemy is above other enemy
                enemy.y = otherEnemy.y - enemy.height;
                enemy.velocityY = 0;
              } else {
                // Enemy is below other enemy
                enemy.y = otherEnemy.y + otherEnemy.height;
                enemy.velocityY = 0;
              }
            }
          }
        }
      }
      
      // Keep enemy in bounds
      if (enemy.x < 0) enemy.x = 0;
      if (enemy.x + enemy.width > this.canvas.width) enemy.x = this.canvas.width - enemy.width;
      
      // Determine enemy animation based on movement
      let newAnimation = 'standing';
      if (enemy.velocityY < -0.1 || enemy.velocityY > 0.1) { // If moving vertically (jumping/falling)
        newAnimation = 'jumping';
      } else if (enemy.velocityX < -0.1) {
        newAnimation = 'walkingLeft';
      } else if (enemy.velocityX > 0.1) {
        newAnimation = 'walkingRight';
      }
      
      // Update enemy animation
      if (newAnimation !== enemy.currentAnimation) {
        enemy.currentAnimation = newAnimation;
        enemy.animationFrame = 0;
        enemy.animationTimer = 0;
      }
      
      // Update enemy animation frame
      enemy.animationTimer++;
      if (enemy.animationTimer >= PLAYER_CONFIG.animationSpeed) {
        enemy.animationTimer = 0;
        const frameCount = this.getFrameCount(enemy.currentAnimation);
        enemy.animationFrame = (enemy.animationFrame + 1) % frameCount;
      }
      
      // Attack player if in range
      if (distance < ENEMY_CONFIG.attackRange) {
        const now = Date.now();
        if (now - enemy.lastAttackTime > ENEMY_CONFIG.attackCooldown) {
          this.player.health -= ENEMY_CONFIG.attackDamage;
          enemy.lastAttackTime = now;
          
          // Prevent health from going below 0
          if (this.player.health < 0) this.player.health = 0;
          
          console.log(`Enemy attacked! Player health: ${this.player.health}`);
        }
      }
    }
  }

  restartGame() {
    // Reset player
    this.player.x = 100;
    this.player.y = this.canvas.height - PLAYER_CONFIG.startOffsetY;
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    this.player.onGround = true;
    this.player.health = PLAYER_CONFIG.maxHealth;
    this.player.lastAttackTime = 0;
    this.player.isAttacking = false;
    this.player.attackStartTime = 0;
    this.player.attackDirection = 'right';

    // Reset game state
    this.gameOver = false;
    this.currentAnimation = 'standing';
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.isJumping = false;
    
    // Respawn enemies
    this.spawnEnemies();
    
    console.log('Game restarted!');
  }
}

// Register the custom element
customElements.define('cpg-side-scroller', CpgSideScroller);