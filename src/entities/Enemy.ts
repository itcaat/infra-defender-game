/**
 * Enemy - Base class for all enemy entities
 */

import Phaser from 'phaser';
import type { EnemyType, EnemyData, GridPosition } from '../types/phaser.types';
import { GAME_CONFIG } from '../config/game.config';
import { ENEMY_CONFIGS, ENEMY_DESCRIPTIONS } from '../config/enemies.config';

export class Enemy extends Phaser.GameObjects.Container {
  private enemyData: EnemyData;
  private enemySprite: Phaser.GameObjects.Rectangle;
  private healthBar: Phaser.GameObjects.Graphics;
  private path: GridPosition[];
  private currentPathIndex: number = 0;
  private moveProgress: number = 0;
  private hasReachedTarget: boolean = false;
  private isDead: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    enemyType: EnemyType,
    path: GridPosition[]
  ) {
    super(scene, x, y);

    const config = ENEMY_CONFIGS[enemyType];
    this.enemyData = {
      ...config,
      health: config.maxHealth,
    };
    this.path = path;

    const desc = ENEMY_DESCRIPTIONS[enemyType];

    // Create visual representation with better graphics
    // Shadow
    const shadow = scene.add.ellipse(0, 5, 44, 16, 0x000000, 0.4);
    this.add(shadow);

    // Enemy body with gradient effect
    const bodyOuter = scene.add.circle(0, 0, 22, desc.color);
    bodyOuter.setStrokeStyle(2, 0x000000, 0.5);
    this.add(bodyOuter);

    this.enemySprite = scene.add.circle(0, 0, 20, desc.color);
    this.add(this.enemySprite);

    // Inner glow
    const innerGlow = scene.add.circle(0, 0, 16, 0xffffff, 0.2);
    this.add(innerGlow);

    // Top highlight
    const highlight = scene.add.ellipse(-4, -6, 10, 8, 0xffffff, 0.4);
    this.add(highlight);

    // Add icon with shadow
    const iconShadow = scene.add.text(1, 1, desc.icon, {
      font: '28px Arial',
      color: '#000000',
    });
    iconShadow.setOrigin(0.5);
    iconShadow.setAlpha(0.5);
    this.add(iconShadow);

    const icon = scene.add.text(0, 0, desc.icon, {
      font: '28px Arial',
      stroke: '#000000',
      strokeThickness: 2,
    });
    icon.setOrigin(0.5);
    this.add(icon);

    // Create health bar
    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    this.updateHealthBar();

    // Add to scene
    scene.add.existing(this);

    // Spawn animation - fade in only
    this.setAlpha(0);
    scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 300,
      ease: 'Quad.easeOut',
    });
  }

  /**
   * Update enemy logic (called every frame)
   */
  update(time: number, delta: number): void {
    // Skip if already reached target
    if (this.hasReachedTarget) return;
    
    // Cap delta to prevent huge jumps (e.g., when tab is inactive)
    const cappedDelta = Math.min(delta, 100);
    
    // Move along path
    this.moveAlongPath(cappedDelta);

    // Check if reached end (only trigger once)
    if (this.hasReachedEnd() && !this.hasReachedTarget) {
      this.hasReachedTarget = true;
      this.onReachEnd();
    }
  }

  /**
   * Move along the path
   */
  private moveAlongPath(delta: number): void {
    // Check if already at the end
    if (this.currentPathIndex >= this.path.length - 1 && this.moveProgress >= 1) {
      return; // Already reached end
    }

    // Make sure we have a next point
    if (this.currentPathIndex >= this.path.length - 1) {
      this.moveProgress = 1; // Ensure we're at 100% on last segment
      return;
    }

    const currentPoint = this.path[this.currentPathIndex];
    const nextPoint = this.path[this.currentPathIndex + 1];

    // Use PATH_GRID_SIZE for fine path movement
    const startX = currentPoint.x * GAME_CONFIG.PATH_GRID_SIZE + GAME_CONFIG.PATH_GRID_SIZE / 2;
    const startY = currentPoint.y * GAME_CONFIG.PATH_GRID_SIZE + GAME_CONFIG.PATH_GRID_SIZE / 2;
    const endX = nextPoint.x * GAME_CONFIG.PATH_GRID_SIZE + GAME_CONFIG.PATH_GRID_SIZE / 2;
    const endY = nextPoint.y * GAME_CONFIG.PATH_GRID_SIZE + GAME_CONFIG.PATH_GRID_SIZE / 2;

    const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY);
    
    // More stable movement calculation
    const moveAmount = (this.enemyData.speed * (delta / 1000));
    
    if (distance > 0) {
      this.moveProgress += moveAmount / distance;
    }

    // Check if we completed this segment
    if (this.moveProgress >= 1) {
      // Move to next segment
      this.currentPathIndex++;
      
      // If not at the last segment, continue moving
      if (this.currentPathIndex < this.path.length - 1) {
        const overflow = this.moveProgress - 1;
        this.moveProgress = 0;
        
        // Process remaining movement with overflow
        if (overflow > 0) {
          return this.moveAlongPath(delta * overflow);
        }
      } else {
        // On the last segment now
        this.moveProgress = 0;
      }
    }

    // Smooth interpolation with clamping
    const t = Math.min(Math.max(this.moveProgress, 0), 1);
    
    // Use linear interpolation for smooth movement
    this.x = Phaser.Math.Linear(startX, endX, t);
    this.y = Phaser.Math.Linear(startY, endY, t);
  }

  /**
   * Take damage
   */
  takeDamage(amount: number): void {
    // Skip if already dead
    if (this.isDead) return;
    
    this.enemyData.health = Math.max(0, this.enemyData.health - amount);
    this.updateHealthBar();

    // Damage flash effect
    this.scene.tweens.add({
      targets: this.enemySprite,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
    });

    // Show damage number
    this.showDamageNumber(amount);

    if (this.enemyData.health <= 0 && !this.isDead) {
      this.isDead = true;
      this.onDeath();
    }
  }

  /**
   * Show floating damage number
   */
  private showDamageNumber(damage: number): void {
    const damageText = this.scene.add.text(0, -30, `-${Math.round(damage)}`, {
      font: 'bold 16px Arial',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 3,
    });
    damageText.setOrigin(0.5);
    this.add(damageText);

    this.scene.tweens.add({
      targets: damageText,
      y: -60,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => damageText.destroy(),
    });
  }

  /**
   * Update health bar visual
   */
  private updateHealthBar(): void {
    this.healthBar.clear();

    const barWidth = 40;
    const barHeight = 5;
    const healthPercent = Math.max(0, this.enemyData.health / this.enemyData.maxHealth);

    // Background with border
    this.healthBar.fillStyle(0x000000, 0.9);
    this.healthBar.fillRoundedRect(-barWidth / 2 - 1, -26, barWidth + 2, barHeight + 2, 2);
    
    this.healthBar.lineStyle(1, 0x00ff00, 0.5);
    this.healthBar.strokeRoundedRect(-barWidth / 2 - 1, -26, barWidth + 2, barHeight + 2, 2);

    // Health with gradient effect
    const healthColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xff9800 : 0xff0000;
    const darkHealthColor = healthPercent > 0.5 ? 0x1a4a1a : healthPercent > 0.25 ? 0x4a3a1a : 0x4a1a1a;
    
    // Dark base
    this.healthBar.fillStyle(darkHealthColor, 1);
    this.healthBar.fillRoundedRect(-barWidth / 2, -25, barWidth * healthPercent, barHeight, 2);
    
    // Bright top
    this.healthBar.fillStyle(healthColor, 1);
    this.healthBar.fillRoundedRect(-barWidth / 2, -25, barWidth * healthPercent, 2, 2);
  }

  /**
   * Check if enemy reached the end
   */
  private hasReachedEnd(): boolean {
    return this.currentPathIndex >= this.path.length - 1 && this.moveProgress >= 1;
  }

  /**
   * Handle reaching the end
   */
  private onReachEnd(): void {
    console.log('Enemy reached end! Error budget damage:', this.enemyData.errorBudgetDamage);
    this.scene.events.emit('enemy:reachedEnd', this.enemyData);
    this.destroy();
  }

  /**
   * Handle death
   */
  private onDeath(): void {
    console.log('💀 Enemy died! Reward:', this.enemyData.reward);
    
    // Death animation - fade out only
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.scene.events.emit('enemy:killed', this.enemyData);
        this.destroy();
      }
    });

    // Improved death particles - explosion burst
    const desc = ENEMY_DESCRIPTIONS[this.enemyData.type];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const distance = 30 + Math.random() * 30;
      const particle = this.scene.add.circle(this.x, this.y, 3 + Math.random() * 3, desc.color);
      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * distance,
        y: this.y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 400 + Math.random() * 200,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }

    // Ring wave effect - expanding circles
    for (let i = 0; i < 2; i++) {
      const ring = this.scene.add.circle(this.x, this.y, 20, desc.color, 0);
      ring.setStrokeStyle(3, desc.color);
      this.scene.tweens.add({
        targets: ring,
        radius: 50,
        alpha: 0,
        duration: 400 + i * 100,
        delay: i * 50,
        ease: 'Quad.easeOut',
        onComplete: () => ring.destroy(),
      });
    }

    // Screen shake for visual impact
    this.scene.cameras.main.shake(100, 0.002);
  }

  /**
   * Get enemy data
   */
  getData(): EnemyData {
    return { ...this.enemyData };
  }
}

