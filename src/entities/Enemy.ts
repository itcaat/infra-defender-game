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

    // Create visual representation (placeholder)
    this.enemySprite = scene.add.rectangle(0, 0, 40, 40, desc.color);
    this.add(this.enemySprite);

    // Add icon
    const icon = scene.add.text(0, 0, desc.icon, {
      font: '24px Arial',
    });
    icon.setOrigin(0.5);
    this.add(icon);

    // Create health bar
    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    this.updateHealthBar();

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Update enemy logic (called every frame)
   */
  update(time: number, delta: number): void {
    // Cap delta to prevent huge jumps (e.g., when tab is inactive)
    const cappedDelta = Math.min(delta, 100);
    
    // Move along path
    this.moveAlongPath(cappedDelta);

    // Check if reached end
    if (this.hasReachedEnd()) {
      this.onReachEnd();
    }
  }

  /**
   * Move along the path
   */
  private moveAlongPath(delta: number): void {
    if (this.currentPathIndex >= this.path.length - 1) {
      return; // Reached end
    }

    const currentPoint = this.path[this.currentPathIndex];
    const nextPoint = this.path[this.currentPathIndex + 1];

    const startX = currentPoint.x * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;
    const startY = currentPoint.y * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;
    const endX = nextPoint.x * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;
    const endY = nextPoint.y * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;

    const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY);
    
    // More stable movement calculation
    const moveAmount = (this.enemyData.speed * (delta / 1000));
    
    if (distance > 0) {
      this.moveProgress += moveAmount / distance;
    }

    if (this.moveProgress >= 1) {
      this.moveProgress = 0;
      this.currentPathIndex++;
      
      // Make sure we don't overshoot
      if (this.currentPathIndex < this.path.length - 1) {
        // Continue to next segment
        return this.moveAlongPath(0); // Process remaining movement
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
    this.enemyData.health = Math.max(0, this.enemyData.health - amount);
    this.updateHealthBar();

    if (this.enemyData.health <= 0) {
      this.onDeath();
    }
  }

  /**
   * Update health bar visual
   */
  private updateHealthBar(): void {
    this.healthBar.clear();

    const barWidth = 40;
    const barHeight = 4;
    const healthPercent = this.enemyData.health / this.enemyData.maxHealth;

    // Background
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(-barWidth / 2, -25, barWidth, barHeight);

    // Health
    const healthColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xff9800 : 0xff0000;
    this.healthBar.fillStyle(healthColor, 1);
    this.healthBar.fillRect(-barWidth / 2, -25, barWidth * healthPercent, barHeight);
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
    console.log('Enemy died! Reward:', this.enemyData.reward);
    this.scene.events.emit('enemy:killed', this.enemyData);
    this.destroy();
  }

  /**
   * Get enemy data
   */
  getData(): EnemyData {
    return { ...this.enemyData };
  }
}

