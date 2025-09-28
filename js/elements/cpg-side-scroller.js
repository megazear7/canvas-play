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
  attackRange: 160, // Increased from 50 to allow attacking with collision detection
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
  attackRange: 120, // Increased from 40 to match player range
  detectionRange: 600, // Distance at which enemy starts chasing player
  attackCooldown: 800 // ms between attacks
};

// Orb configuration
const ORB_CONFIG = {
  width: 24,
  height: 24,
  color: '#FF0000',
  bounceFactor: 0.7, // How much velocity is retained when bouncing
  healthValue: 25, // Health gained when collected
  spawnInterval: 12000 // ms between orb spawns
};

// Damage orb configuration
const DAMAGE_ORB_CONFIG = {
  width: 24,
  height: 24,
  color: '#00FF00', // Green color
  bounceFactor: 0.7,
  damageValue: 20, // Damage dealt when touched
  spawnInterval: 15000 // ms between damage orb spawns
};

// Game configuration
const GAME_CONFIG = {
  initialMaxOrcs: 2,
  orcSpawnInterval: 10000,
  maxOrcIncreaseInterval: 30000,
  platformCount: 8,
};

export default class CpgSideScroller extends BaseElement {
  constructor() {
    super();
    this.createProps(CpgSideScroller.observedAttributes);
    this.configure({ fullScreen: true });

    // Safe canvas dimensions (fallback if not set)
    const canvasWidth = this.canvas ? this.canvas.width : 800;
    const canvasHeight = this.canvas ? this.canvas.height : 600;

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
      y: canvasHeight - PLAYER_CONFIG.startOffsetY,
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

    // Orb management
    this.orbs = [];
    this.lastOrbSpawn = 0;

    // Damage orb management
    this.damageOrbs = [];
    this.lastDamageOrbSpawn = 0;

    // Dynamic orc spawning
    this.maxOrcs = GAME_CONFIG.initialMaxOrcs;
    this.orcSpawnInterval = GAME_CONFIG.orcSpawnInterval; // Dynamic interval that decreases
    this.lastOrcSpawn = 0;
    this.lastMaxOrcIncrease = Date.now();

    // Game state
    this.gameOver = false;

    this.gravity = PLAYER_CONFIG.gravity;
    this.jumpForce = PLAYER_CONFIG.jumpForce;
    this.moveSpeed = PLAYER_CONFIG.moveSpeed;
    this.friction = PLAYER_CONFIG.friction;

    // Ground level
    this.groundY = canvasHeight - 50;

    // Generate platforms
    this.generatePlatforms();

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
      this.enemyImage.src = '/images/side-scroller/sprites/orc-standing-001.png';
    });

    // Load enemy sprites for all animation types
    const animationConfigs = [
      { type: 'standing', frameCount: 10 },
      { type: 'walking-left', frameCount: 10 }, 
      { type: 'walking-right', frameCount: 10 },
      { type: 'jumping', frameCount: 10 },
      { type: 'attack-left', frameCount: 10 },
      { type: 'attack-right', frameCount: 10 }
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
        img.src = `/images/side-scroller/sprites/orc-${config.type}-${frameNumber}.png`;
        
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
        img.src = `/images/side-scroller/sprites/halfling-${config.type}-${frameNumber}.png`;
        
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

  generatePlatforms() {
    this.platforms = [];
    
    // Generate random platforms
    for (let i = 0; i < GAME_CONFIG.platformCount; i++) {
      const width = 100 + Math.random() * 200; // Random width between 100-300
      const height = 20 + Math.random() * 30; // Random height between 20-50
      const x = Math.random() * (this.canvas.width - width);
      const y = this.groundY - 100 - Math.random() * 300; // Random height above ground
      
      const colors = ['#8B4513', '#A0522D', '#CD853F', '#D2691E'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      this.platforms.push({
        x: x,
        y: y,
        width: width,
        height: height,
        color: color
      });
    }
    
    // Sort platforms by Y position (lowest first for collision detection)
    this.platforms.sort((a, b) => b.y - a.y);
  }

  checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
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
            this.player.x = enemy.x - this.player.width;
          } else {
            this.player.x = enemy.x + enemy.width;
          }
        } else {
          // Vertical collision - separate on Y axis
          if (this.player.y < enemy.y) {
            this.player.y = enemy.y - this.player.height;
            this.player.velocityY = 0;
            this.player.onGround = true;
          } else {
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
            
            // Remove enemy if health <= 0 and spawn orb
            if (enemy.health <= 0) {
              // 75% chance for health orb, 25% chance for damage orb
              if (Math.random() < 0.25) {
                this.spawnDamageOrb(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
              } else {
                this.spawnOrb(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
              }
              this.enemies.splice(i, 1);
              console.log('Enemy defeated!');
            }
          }
        }
      }
    }
    
    // Enemy AI and combat
    this.updateEnemies();

    // Update orbs
    this.updateOrbs();

    // Update damage orbs
    this.updateDamageOrbs();

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

  updateEnemies() {
    const now = Date.now();
    
    // Spawn new enemies over time
    if (this.enemies.length < this.maxOrcs && now - this.lastOrcSpawn > this.orcSpawnInterval) {
      this.spawnEnemy();
      this.lastOrcSpawn = now;
    }
    
    // Increase max orcs over time
    if (now - this.lastMaxOrcIncrease > GAME_CONFIG.maxOrcIncreaseInterval) {
      this.maxOrcs++;
      this.lastMaxOrcIncrease = now;
      console.log(`Max orcs increased to ${this.maxOrcs}`);
    }
    
    // Update each enemy
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Calculate distance to player
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Enemy AI
      if (distance < ENEMY_CONFIG.detectionRange) {
        // Move towards player
        if (dx > 10) {
          enemy.velocityX = ENEMY_CONFIG.moveSpeed;
          enemy.currentAnimation = 'walkingRight';
        } else if (dx < -10) {
          enemy.velocityX = -ENEMY_CONFIG.moveSpeed;
          enemy.currentAnimation = 'walkingLeft';
        } else {
          enemy.velocityX = 0;
          enemy.currentAnimation = 'standing';
        }
        
        // Attack if in range
        if (distance < ENEMY_CONFIG.attackRange && now - enemy.lastAttackTime > ENEMY_CONFIG.attackCooldown) {
          enemy.isAttacking = true;
          enemy.attackStartTime = now;
          enemy.lastAttackTime = now;
          enemy.attackDirection = dx > 0 ? 'right' : 'left';
          
          // Deal damage to player
          this.player.health -= ENEMY_CONFIG.attackDamage;
          console.log(`Enemy attacked! Player health: ${this.player.health}`);
        }
      } else {
        // Idle behavior
        enemy.velocityX = 0;
        enemy.currentAnimation = 'standing';
      }
      
      // Apply gravity
      enemy.velocityY += this.gravity;
      
      // Update position
      enemy.x += enemy.velocityX;
      enemy.y += enemy.velocityY;
      
      // Ground collision
      if (enemy.y + enemy.height >= this.groundY) {
        enemy.y = this.groundY - enemy.height;
        enemy.velocityY = 0;
      }
      
      // Platform collisions
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
      
      // Update enemy animation
      if (enemy.isAttacking) {
        const attackElapsed = now - enemy.attackStartTime;
        if (attackElapsed >= 500) {
          enemy.isAttacking = false;
        } else {
          enemy.currentAnimation = enemy.attackDirection === 'left' ? 'attackLeft' : 'attackRight';
        }
      }
      
      // Update animation frame
      enemy.animationTimer++;
      if (enemy.animationTimer >= this.animationSpeed) {
        enemy.animationTimer = 0;
        const frameCount = this.getFrameCount(enemy.currentAnimation);
        enemy.animationFrame = (enemy.animationFrame + 1) % frameCount;
      }
      
      // Keep enemy in bounds
      if (enemy.x < 0) enemy.x = 0;
      if (enemy.x + enemy.width > this.canvas.width) {
        enemy.x = this.canvas.width - enemy.width;
      }
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

    // Draw orbs
    for (const orb of this.orbs) {
      if (!orb.collected) {
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(orb.x + orb.width / 2, orb.y + orb.height / 2, orb.width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw damage orbs
    for (const orb of this.damageOrbs) {
      if (!orb.collected) {
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(orb.x + orb.width / 2, orb.y + orb.height / 2, orb.width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw instructions
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(20, 42, 390, 45);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '16px Arial';
    ctx.fillText('Use arrow keys to move,\n↑ to jump, space to attack!', 215, 70);

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
        animationTimer: 0,
        isAttacking: false,
        attackStartTime: 0,
        attackDirection: 'left' // Default for enemies facing player
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
        animationTimer: 0,
        isAttacking: false,
        attackStartTime: 0,
        attackDirection: 'left' // Default for enemies facing player
      }
    ];
  }

  spawnEnemy() {
    // Spawn a single enemy at a random position
    const side = Math.random() < 0.5 ? 'left' : 'right';
    let x;
    if (side === 'left') {
      x = -ENEMY_CONFIG.width; // Off-screen left
    } else {
      x = this.canvas.width; // Off-screen right
    }
    
    const enemy = {
      x: x,
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
      animationTimer: 0,
      isAttacking: false,
      attackStartTime: 0,
      attackDirection: 'left'
    };
    
    this.enemies.push(enemy);
    
    // Decrease spawn interval by 10% for next spawn
    this.orcSpawnInterval *= 0.9;
    console.log(`Enemy spawned! Next spawn interval: ${this.orcSpawnInterval}ms`);
  }

  spawnOrb(x, y) {
    this.orbs.push({
      x: x,
      y: y,
      width: ORB_CONFIG.width,
      height: ORB_CONFIG.height,
      velocityX: (Math.random() - 0.5) * 4, // Random horizontal velocity
      velocityY: -Math.random() * 3 - 2, // Initial upward velocity
      color: ORB_CONFIG.color,
      collected: false
    });
  }

  spawnDamageOrb(x, y) {
    this.damageOrbs.push({
      x: x,
      y: y,
      width: DAMAGE_ORB_CONFIG.width,
      height: DAMAGE_ORB_CONFIG.height,
      velocityX: (Math.random() - 0.5) * 4, // Random horizontal velocity
      velocityY: -Math.random() * 3 - 2, // Initial upward velocity
      color: DAMAGE_ORB_CONFIG.color,
      collected: false
    });
  }

  updateOrbs() {
    const now = Date.now();
    
    // Spawn orbs periodically
    if (now - this.lastOrbSpawn > ORB_CONFIG.spawnInterval) {
      const x = Math.random() * (this.canvas.width - ORB_CONFIG.width);
      const y = this.groundY - ORB_CONFIG.height - Math.random() * 200;
      this.spawnOrb(x, y);
      this.lastOrbSpawn = now;
    }
    
    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const orb = this.orbs[i];
      
      // Apply gravity
      orb.velocityY += this.gravity * 0.5; // Lighter gravity for orbs
      
      // Update position
      orb.x += orb.velocityX;
      orb.y += orb.velocityY;
      
      // Ground collision
      if (orb.y + orb.height >= this.groundY) {
        orb.y = this.groundY - orb.height;
        orb.velocityY = -orb.velocityY * ORB_CONFIG.bounceFactor;
        orb.velocityX *= 0.8; // Friction
      }
      
      // Platform collisions
      for (const platform of this.platforms) {
        if (orb.x < platform.x + platform.width &&
            orb.x + orb.width > platform.x &&
            orb.y < platform.y + platform.height &&
            orb.y + orb.height > platform.y) {
          
          // Landing on top of platform
          if (orb.velocityY > 0 &&
              orb.y < platform.y &&
              orb.y + orb.height > platform.y) {
            orb.y = platform.y - orb.height;
            orb.velocityY = -orb.velocityY * ORB_CONFIG.bounceFactor;
            orb.velocityX *= 0.8; // Friction
          }
        }
      }
      
      // Keep orb in bounds
      if (orb.x < 0) {
        orb.x = 0;
        orb.velocityX = -orb.velocityX * ORB_CONFIG.bounceFactor;
      }
      if (orb.x + orb.width > this.canvas.width) {
        orb.x = this.canvas.width - orb.width;
        orb.velocityX = -orb.velocityX * ORB_CONFIG.bounceFactor;
      }
      
      // Check collection by player
      if (!orb.collected && this.checkCollision(this.player, orb)) {
        // Player collects orb
        this.player.health = Math.min(this.player.health + ORB_CONFIG.healthValue, PLAYER_CONFIG.maxHealth);
        orb.collected = true;
        console.log(`Orb collected! Player health: ${this.player.health}`);
      }
      
      // Remove collected orbs
      if (orb.collected) {
        this.orbs.splice(i, 1);
      }
    }
  }

  spawnDamageOrb(x, y) {
    this.damageOrbs.push({
      x: x,
      y: y,
      width: DAMAGE_ORB_CONFIG.width,
      height: DAMAGE_ORB_CONFIG.height,
      velocityX: (Math.random() - 0.5) * 4, // Random horizontal velocity
      velocityY: -Math.random() * 3 - 2, // Initial upward velocity
      color: DAMAGE_ORB_CONFIG.color,
      collected: false
    });
  }

  updateDamageOrbs() {
    const now = Date.now();
    
    // Spawn damage orbs periodically
    if (now - this.lastDamageOrbSpawn > DAMAGE_ORB_CONFIG.spawnInterval) {
      const x = Math.random() * (this.canvas.width - DAMAGE_ORB_CONFIG.width);
      const y = this.groundY - DAMAGE_ORB_CONFIG.height - Math.random() * 200;
      this.spawnDamageOrb(x, y);
      this.lastDamageOrbSpawn = now;
    }
    
    for (let i = this.damageOrbs.length - 1; i >= 0; i--) {
      const orb = this.damageOrbs[i];
      
      // Apply gravity
      orb.velocityY += this.gravity * 0.5; // Lighter gravity for orbs
      
      // Update position
      orb.x += orb.velocityX;
      orb.y += orb.velocityY;
      
      // Ground collision
      if (orb.y + orb.height >= this.groundY) {
        orb.y = this.groundY - orb.height;
        orb.velocityY = -orb.velocityY * DAMAGE_ORB_CONFIG.bounceFactor;
        orb.velocityX *= 0.8; // Friction
      }
      
      // Platform collisions
      for (const platform of this.platforms) {
        if (orb.x < platform.x + platform.width &&
            orb.x + orb.width > platform.x &&
            orb.y < platform.y + platform.height &&
            orb.y + orb.height > platform.y) {
          
          // Landing on top of platform
          if (orb.velocityY > 0 &&
              orb.y < platform.y &&
              orb.y + orb.height > platform.y) {
            orb.y = platform.y - orb.height;
            orb.velocityY = -orb.velocityY * DAMAGE_ORB_CONFIG.bounceFactor;
            orb.velocityX *= 0.8; // Friction
          }
        }
      }
      
      // Keep orb in bounds
      if (orb.x < 0) {
        orb.x = 0;
        orb.velocityX = -orb.velocityX * DAMAGE_ORB_CONFIG.bounceFactor;
      }
      if (orb.x + orb.width > this.canvas.width) {
        orb.x = this.canvas.width - orb.width;
        orb.velocityX = -orb.velocityX * DAMAGE_ORB_CONFIG.bounceFactor;
      }
      
      // Check collision with player (damage player)
      if (!orb.collected && this.checkCollision(this.player, orb)) {
        // Player takes damage
        this.player.health -= DAMAGE_ORB_CONFIG.damageValue;
        orb.collected = true;
        console.log(`Damage orb hit! Player health: ${this.player.health}`);
      }
      
      // Remove collected orbs
      if (orb.collected) {
        this.damageOrbs.splice(i, 1);
      }
    }
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

  generatePlatforms() {
    this.platforms = [];
    
    // Generate random platforms
    for (let i = 0; i < GAME_CONFIG.platformCount; i++) {
      const width = 100 + Math.random() * 200; // Random width between 100-300
      const height = 20 + Math.random() * 30; // Random height between 20-50
      const x = Math.random() * (this.canvas.width - width);
      const y = this.groundY - 100 - Math.random() * 300; // Random height above ground
      
      const colors = ['#8B4513', '#A0522D', '#CD853F', '#D2691E'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      this.platforms.push({
        x: x,
        y: y,
        width: width,
        height: height,
        color: color
      });
    }
    
    // Sort platforms by Y position (lowest first for collision detection)
    this.platforms.sort((a, b) => b.y - a.y);
  }

  checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
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
            this.player.x = enemy.x - this.player.width;
          } else {
            this.player.x = enemy.x + enemy.width;
          }
        } else {
          // Vertical collision - separate on Y axis
          if (this.player.y < enemy.y) {
            this.player.y = enemy.y - this.player.height;
            this.player.velocityY = 0;
            this.player.onGround = true;
          } else {
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
            
            // Remove enemy if health <= 0 and spawn orb
            if (enemy.health <= 0) {
              // 75% chance for health orb, 25% chance for damage orb
              if (Math.random() < 0.25) {
                this.spawnDamageOrb(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
              } else {
                this.spawnOrb(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
              }
              this.enemies.splice(i, 1);
              console.log('Enemy defeated!');
            }
          }
        }
      }
    }
    
    // Enemy AI and combat
    this.updateEnemies();

    // Update orbs
    this.updateOrbs();

    // Update damage orbs
    this.updateDamageOrbs();

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

  updateEnemies() {
    const now = Date.now();
    
    // Spawn new enemies over time
    if (this.enemies.length < this.maxOrcs && now - this.lastOrcSpawn > this.orcSpawnInterval) {
      this.spawnEnemy();
      this.lastOrcSpawn = now;
    }
    
    // Increase max orcs over time
    if (now - this.lastMaxOrcIncrease > GAME_CONFIG.maxOrcIncreaseInterval) {
      this.maxOrcs++;
      this.lastMaxOrcIncrease = now;
      console.log(`Max orcs increased to ${this.maxOrcs}`);
    }
    
    // Update each enemy
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Calculate distance to player
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Enemy AI
      if (distance < ENEMY_CONFIG.detectionRange) {
        // Move towards player
        if (dx > 10) {
          enemy.velocityX = ENEMY_CONFIG.moveSpeed;
          enemy.currentAnimation = 'walkingRight';
        } else if (dx < -10) {
          enemy.velocityX = -ENEMY_CONFIG.moveSpeed;
          enemy.currentAnimation = 'walkingLeft';
        } else {
          enemy.velocityX = 0;
          enemy.currentAnimation = 'standing';
        }
        
        // Attack if in range
        if (distance < ENEMY_CONFIG.attackRange && now - enemy.lastAttackTime > ENEMY_CONFIG.attackCooldown) {
          enemy.isAttacking = true;
          enemy.attackStartTime = now;
          enemy.lastAttackTime = now;
          enemy.attackDirection = dx > 0 ? 'right' : 'left';
          
          // Deal damage to player
          this.player.health -= ENEMY_CONFIG.attackDamage;
          console.log(`Enemy attacked! Player health: ${this.player.health}`);
        }
      } else {
        // Idle behavior
        enemy.velocityX = 0;
        enemy.currentAnimation = 'standing';
      }
      
      // Apply gravity
      enemy.velocityY += this.gravity;
      
      // Update position
      enemy.x += enemy.velocityX;
      enemy.y += enemy.velocityY;
      
      // Ground collision
      if (enemy.y + enemy.height >= this.groundY) {
        enemy.y = this.groundY - enemy.height;
        enemy.velocityY = 0;
      }
      
      // Platform collisions
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
      
      // Update enemy animation
      if (enemy.isAttacking) {
        const attackElapsed = now - enemy.attackStartTime;
        if (attackElapsed >= 500) {
          enemy.isAttacking = false;
        } else {
          enemy.currentAnimation = enemy.attackDirection === 'left' ? 'attackLeft' : 'attackRight';
        }
      }
      
      // Update animation frame
      enemy.animationTimer++;
      if (enemy.animationTimer >= this.animationSpeed) {
        enemy.animationTimer = 0;
        const frameCount = this.getFrameCount(enemy.currentAnimation);
        enemy.animationFrame = (enemy.animationFrame + 1) % frameCount;
      }
      
      // Keep enemy in bounds
      if (enemy.x < 0) enemy.x = 0;
      if (enemy.x + enemy.width > this.canvas.width) {
        enemy.x = this.canvas.width - enemy.width;
      }
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

    // Draw orbs
    for (const orb of this.orbs) {
      if (!orb.collected) {
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(orb.x + orb.width / 2, orb.y + orb.height / 2, orb.width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw damage orbs
    for (const orb of this.damageOrbs) {
      if (!orb.collected) {
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(orb.x + orb.width / 2, orb.y + orb.height / 2, orb.width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw instructions
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(20, 42, 390, 45);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '16px Arial';
    ctx.fillText('Use arrow keys to move,\n↑ to jump, space to attack!', 215, 70);

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
        animationTimer: 0,
        isAttacking: false,
        attackStartTime: 0,
        attackDirection: 'left' // Default for enemies facing player
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
        animationTimer: 0,
        isAttacking: false,
        attackStartTime: 0,
        attackDirection: 'left' // Default for enemies facing player
      }
    ];
  }

  spawnEnemy() {
    // Spawn a single enemy at a random position
    const side = Math.random() < 0.5 ? 'left' : 'right';
    let x;
    if (side === 'left') {
      x = -ENEMY_CONFIG.width; // Off-screen left
    } else {
      x = this.canvas.width; // Off-screen right
    }
    
    const enemy = {
      x: x,
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
      animationTimer: 0,
      isAttacking: false,
      attackStartTime: 0,
      attackDirection: 'left'
    };
    
    this.enemies.push(enemy);
    
    // Decrease spawn interval by 10% for next spawn
    this.orcSpawnInterval *= 0.9;
    console.log(`Enemy spawned! Next spawn interval: ${this.orcSpawnInterval}ms`);
  }

  spawnOrb(x, y) {
    this.orbs.push({
      x: x,
      y: y,
      width: ORB_CONFIG.width,
      height: ORB_CONFIG.height,
      velocityX: (Math.random() - 0.5) * 4, // Random horizontal velocity
      velocityY: -Math.random() * 3 - 2, // Initial upward velocity
      color: ORB_CONFIG.color,
      collected: false
    });
  }

  spawnDamageOrb(x, y) {
    this.damageOrbs.push({
      x: x,
      y: y,
      width: DAMAGE_ORB_CONFIG.width,
      height: DAMAGE_ORB_CONFIG.height,
      velocityX: (Math.random() - 0.5) * 4, // Random horizontal velocity
      velocityY: -Math.random() * 3 - 2, // Initial upward velocity
      color: DAMAGE_ORB_CONFIG.color,
      collected: false
    });
  }

  updateOrbs() {
    const now = Date.now();
    
    // Spawn orbs periodically
    if (now - this.lastOrbSpawn > ORB_CONFIG.spawnInterval) {
      const x = Math.random() * (this.canvas.width - ORB_CONFIG.width);
      const y = this.groundY - ORB_CONFIG.height - Math.random() * 200;
      this.spawnOrb(x, y);
      this.lastOrbSpawn = now;
    }
    
    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const orb = this.orbs[i];
      
      // Apply gravity
      orb.velocityY += this.gravity * 0.5; // Lighter gravity for orbs
      
      // Update position
      orb.x += orb.velocityX;
      orb.y += orb.velocityY;
      
      // Ground collision
      if (orb.y + orb.height >= this.groundY) {
        orb.y = this.groundY - orb.height;
        orb.velocityY = -orb.velocityY * ORB_CONFIG.bounceFactor;
        orb.velocityX *= 0.8; // Friction
      }
      
      // Platform collisions
      for (const platform of this.platforms) {
        if (orb.x < platform.x + platform.width &&
            orb.x + orb.width > platform.x &&
            orb.y < platform.y + platform.height &&
            orb.y + orb.height > platform.y) {
          
          // Landing on top of platform
          if (orb.velocityY > 0 &&
              orb.y < platform.y &&
              orb.y + orb.height > platform.y) {
            orb.y = platform.y - orb.height;
            orb.velocityY = -orb.velocityY * ORB_CONFIG.bounceFactor;
            orb.velocityX *= 0.8; // Friction
          }
        }
      }
      
      // Keep orb in bounds
      if (orb.x < 0) {
        orb.x = 0;
        orb.velocityX = -orb.velocityX * ORB_CONFIG.bounceFactor;
      }
      if (orb.x + orb.width > this.canvas.width) {
        orb.x = this.canvas.width - orb.width;
        orb.velocityX = -orb.velocityX * ORB_CONFIG.bounceFactor;
      }
      
      // Check collection by player
      if (!orb.collected && this.checkCollision(this.player, orb)) {
        // Player collects orb
        this.player.health = Math.min(this.player.health + ORB_CONFIG.healthValue, PLAYER_CONFIG.maxHealth);
        orb.collected = true;
        console.log(`Orb collected! Player health: ${this.player.health}`);
      }
      
      // Remove collected orbs
      if (orb.collected) {
        this.orbs.splice(i, 1);
      }
    }
  }

  spawnDamageOrb(x, y) {
    this.damageOrbs.push({
      x: x,
      y: y,
      width: DAMAGE_ORB_CONFIG.width,
      height: DAMAGE_ORB_CONFIG.height,
      velocityX: (Math.random() - 0.5) * 4, // Random horizontal velocity
      velocityY: -Math.random() * 3 - 2, // Initial upward velocity
      color: DAMAGE_ORB_CONFIG.color,
      collected: false
    });
  }

  updateDamageOrbs() {
    const now = Date.now();
    
    // Spawn damage orbs periodically
    if (now - this.lastDamageOrbSpawn > DAMAGE_ORB_CONFIG.spawnInterval) {
      const x = Math.random() * (this.canvas.width - DAMAGE_ORB_CONFIG.width);
      const y = this.groundY - DAMAGE_ORB_CONFIG.height - Math.random() * 200;
      this.spawnDamageOrb(x, y);
      this.lastDamageOrbSpawn = now;
    }
    
    for (let i = this.damageOrbs.length - 1; i >= 0; i--) {
      const orb = this.damageOrbs[i];
      
      // Apply gravity
      orb.velocityY += this.gravity * 0.5; // Lighter gravity for orbs
      
      // Update position
      orb.x += orb.velocityX;
      orb.y += orb.velocityY;
      
      // Ground collision
      if (orb.y + orb.height >= this.groundY) {
        orb.y = this.groundY - orb.height;
        orb.velocityY = -orb.velocityY * DAMAGE_ORB_CONFIG.bounceFactor;
        orb.velocityX *= 0.8; // Friction
      }
      
      // Platform collisions
      for (const platform of this.platforms) {
        if (orb.x < platform.x + platform.width &&
            orb.x + orb.width > platform.x &&
            orb.y < platform.y + platform.height &&
            orb.y + orb.height > platform.y) {
          
          // Landing on top of platform
          if (orb.velocityY > 0 &&
              orb.y < platform.y &&
              orb.y + orb.height > platform.y) {
            orb.y = platform.y - orb.height;
            orb.velocityY = -orb.velocityY * DAMAGE_ORB_CONFIG.bounceFactor;
            orb.velocityX *= 0.8; // Friction
          }
        }
      }
      
      // Keep orb in bounds
      if (orb.x < 0) {
        orb.x = 0;
        orb.velocityX = -orb.velocityX * DAMAGE_ORB_CONFIG.bounceFactor;
      }
      if (orb.x + orb.width > this.canvas.width) {
        orb.x = this.canvas.width - orb.width;
        orb.velocityX = -orb.velocityX * DAMAGE_ORB_CONFIG.bounceFactor;
      }
      
      // Check collision with player (damage player)
      if (!orb.collected && this.checkCollision(this.player, orb)) {
        // Player takes damage
        this.player.health -= DAMAGE_ORB_CONFIG.damageValue;
        orb.collected = true;
        console.log(`Damage orb hit! Player health: ${this.player.health}`);
      }
      
      // Remove collected orbs
      if (orb.collected) {
        this.damageOrbs.splice(i, 1);
      }
    }
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

  generatePlatforms() {
    this.platforms = [];
    
    // Generate random platforms
    for (let i = 0; i < GAME_CONFIG.platformCount; i++) {
      const width = 100 + Math.random() * 200; // Random width between 100-300
      const height = 20 + Math.random() * 30; // Random height between 20-50
      const x = Math.random() * (this.canvas.width - width);
      const y = this.groundY - 100 - Math.random() * 300; // Random height above ground
      
      const colors = ['#8B4513', '#A0522D', '#CD853F', '#D2691E'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      this.platforms.push({
        x: x,
        y: y,
        width: width,
        height: height,
        color: color
      });
    }
    
    // Sort platforms by Y position (lowest first for collision detection)
    this.platforms.sort((a, b) => b.y - a.y);
  }

  checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
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
            this.player.x = enemy.x - this.player.width;
          } else {
            this.player.x = enemy.x + enemy.width;
          }
        } else {
          // Vertical collision - separate on Y axis
          if (this.player.y < enemy.y) {
            this.player.y = enemy.y - this.player.height;
            this.player.velocityY = 0;
            this.player.onGround = true;
          } else {
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
            
            // Remove enemy if health <= 0 and spawn orb
            if (enemy.health <= 0) {
              // 75% chance for health orb, 25% chance for damage orb
              if (Math.random() < 0.25) {
                this.spawnDamageOrb(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
              } else {
                this.spawnOrb(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
              }
              this.enemies.splice(i, 1);
              console.log('Enemy defeated!');
            }
          }
        }
      }
    }
    
    // Enemy AI and combat
    this.updateEnemies();

    // Update orbs
    this.updateOrbs();

    // Update damage orbs
    this.updateDamageOrbs();

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

  updateEnemies() {
    const now = Date.now();
    
    // Spawn new enemies over time
    if (this.enemies.length < this.maxOrcs && now - this.lastOrcSpawn > this.orcSpawnInterval) {
      this.spawnEnemy();
      this.lastOrcSpawn = now;
    }
    
    // Increase max orcs over time
    if (now - this.lastMaxOrcIncrease > GAME_CONFIG.maxOrcIncreaseInterval) {
      this.maxOrcs++;
      this.lastMaxOrcIncrease = now;
      console.log(`Max orcs increased to ${this.maxOrcs}`);
    }
    
    // Update each enemy
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Calculate distance to player
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Enemy AI
      if (distance < ENEMY_CONFIG.detectionRange) {
        // Move towards player
        if (dx > 10) {
          enemy.velocityX = ENEMY_CONFIG.moveSpeed;
          enemy.currentAnimation = 'walkingRight';
        } else if (dx < -10) {
          enemy.velocityX = -ENEMY_CONFIG.moveSpeed;
          enemy.currentAnimation = 'walkingLeft';
        } else {
          enemy.velocityX = 0;
          enemy.currentAnimation = 'standing';
        }
        
        // Attack if in range
        if (distance < ENEMY_CONFIG.attackRange && now - enemy.lastAttackTime > ENEMY_CONFIG.attackCooldown) {
          enemy.isAttacking = true;
          enemy.attackStartTime = now;
          enemy.lastAttackTime = now;
          enemy.attackDirection = dx > 0 ? 'right' : 'left';
          
          // Deal damage to player
          this.player.health -= ENEMY_CONFIG.attackDamage;
          console.log(`Enemy attacked! Player health: ${this.player.health}`);
        }
      } else {
        // Idle behavior
        enemy.velocityX = 0;
        enemy.currentAnimation = 'standing';
      }
      
      // Apply gravity
      enemy.velocityY += this.gravity;
      
      // Update position
      enemy.x += enemy.velocityX;
      enemy.y += enemy.velocityY;
      
      // Ground collision
      if (enemy.y + enemy.height >= this.groundY) {
        enemy.y = this.groundY - enemy.height;
        enemy.velocityY = 0;
      }
      
      // Platform collisions
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
      
      // Update enemy animation
      if (enemy.isAttacking) {
        const attackElapsed = now - enemy.attackStartTime;
        if (attackElapsed >= 500) {
          enemy.isAttacking = false;
        } else {
          enemy.currentAnimation = enemy.attackDirection === 'left' ? 'attackLeft' : 'attackRight';
        }
      }
      
      // Update animation frame
      enemy.animationTimer++;
      if (enemy.animationTimer >= this.animationSpeed) {
        enemy.animationTimer = 0;
        const frameCount = this.getFrameCount(enemy.currentAnimation);
        enemy.animationFrame = (enemy.animationFrame + 1) % frameCount;
      }
      
      // Keep enemy in bounds
      if (enemy.x < 0) enemy.x = 0;
      if (enemy.x + enemy.width > this.canvas.width) {
        enemy.x = this.canvas.width - enemy.width;
      }
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

    // Draw orbs
    for (const orb of this.orbs) {
      if (!orb.collected) {
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(orb.x + orb.width / 2, orb.y + orb.height / 2, orb.width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw damage orbs
    for (const orb of this.damageOrbs) {
      if (!orb.collected) {
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(orb.x + orb.width / 2, orb.y + orb.height / 2, orb.width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw instructions
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(20, 42, 390, 45);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '16px Arial';
    ctx.fillText('Use arrow keys to move,\n↑ to jump, space to attack!', 215, 70);

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
}
