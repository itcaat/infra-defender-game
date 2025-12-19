/**
 * Enemy - Base class for all enemy entities
 */

import Phaser from 'phaser';
import type { EnemyType, EnemyData, GridPosition } from '../types/phaser.types';
import { GAME_CONFIG } from '../config/game.config';

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

    this.enemyData = this.getEnemyData(enemyType);
    this.path = path;

    // Create visual representation (placeholder)
    this.enemySprite = scene.add.rectangle(0, 0, 40, 40, 0xff0000);
    this.add(this.enemySprite);

    // Create health bar
    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    this.updateHealthBar();

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Get enemy data based on type
   */
  private getEnemyData(type: EnemyType): EnemyData {
    // Placeholder data - will be moved to config
    const enemyConfigs: Record<EnemyType, EnemyData> = {
      traffic_spike: {
        type: 'traffic_spike',
        health: 50,
        maxHealth: 50,
        speed: 100, // pixels per second
        errorBudgetDamage: 10,
        reward: 10,
      },
      ddos: {
        type: 'ddos',
        health: 100,
        maxHealth: 100,
        speed: 150,
        errorBudgetDamage: 20,
        reward: 20,
      },
      memory_leak: {
        type: 'memory_leak',
        health: 80,
        maxHealth: 80,
        speed: 60,
        errorBudgetDamage: 15,
        reward: 15,
        specialBehavior: 'grows_over_time',
      },
      slow_query: {
        type: 'slow_query',
        health: 120,
        maxHealth: 120,
        speed: 40,
        errorBudgetDamage: 25,
        reward: 25,
        specialBehavior: 'slows_towers',
      },
      friday_deploy: {
        type: 'friday_deploy',
        health: 200,
        maxHealth: 200,
        speed: 80,
        errorBudgetDamage: 50,
        reward: 50,
        specialBehavior: 'spawns_bugs',
      },
    };

    return enemyConfigs[type];
  }

  /**
   * Update enemy logic (called every frame)
   */
  update(time: number, delta: number): void {
    // Move along path
    this.moveAlongPath(delta);

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
    const moveAmount = (this.enemyData.speed * delta) / 1000;

    this.moveProgress += moveAmount / distance;

    if (this.moveProgress >= 1) {
      this.moveProgress = 0;
      this.currentPathIndex++;
    }

    // Interpolate position
    const t = this.moveProgress;
    this.x = startX + (endX - startX) * t;
    this.y = startY + (endY - startY) * t;
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

