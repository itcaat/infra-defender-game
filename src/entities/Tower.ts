/**
 * Tower - Base class for all tower entities
 */

import Phaser from 'phaser';
import type { TowerType, TowerData } from '../types/phaser.types';
import { GAME_CONFIG } from '../config/game.config';

export class Tower extends Phaser.GameObjects.Container {
  private towerData: TowerData;
  private rangeCircle?: Phaser.GameObjects.Graphics;
  private towerSprite: Phaser.GameObjects.Rectangle;
  private lastAttackTime: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    towerType: TowerType
  ) {
    super(scene, x, y);

    // Get tower data based on type
    this.towerData = this.getTowerData(towerType);

    // Create visual representation (placeholder)
    this.towerSprite = scene.add.rectangle(0, 0, 48, 48, 0x00ff00);
    this.add(this.towerSprite);

    // Add level indicator
    const levelText = scene.add.text(0, -30, `Lv${this.towerData.level}`, {
      font: '12px Arial',
      color: '#ffffff',
    });
    levelText.setOrigin(0.5);
    this.add(levelText);

    // Add to scene
    scene.add.existing(this);

    // Show range on hover (will be implemented)
    this.setInteractive(
      new Phaser.Geom.Rectangle(-24, -24, 48, 48),
      Phaser.Geom.Rectangle.Contains
    );
  }

  /**
   * Get tower data based on type
   */
  private getTowerData(type: TowerType): TowerData {
    // Placeholder data - will be moved to config
    const towerConfigs: Record<TowerType, TowerData> = {
      nginx: {
        type: 'nginx',
        level: 1,
        damage: 10,
        range: 150,
        attackSpeed: 1,
        cost: 100,
        upgradeCost: 150,
        specialAbility: 'rate_limit',
      },
      load_balancer: {
        type: 'load_balancer',
        level: 1,
        damage: 5,
        range: 120,
        attackSpeed: 2,
        cost: 150,
        upgradeCost: 200,
        specialAbility: 'area_buff',
      },
      redis: {
        type: 'redis',
        level: 1,
        damage: 8,
        range: 100,
        attackSpeed: 1.5,
        cost: 120,
        upgradeCost: 180,
        specialAbility: 'slow',
      },
      kafka: {
        type: 'kafka',
        level: 1,
        damage: 15,
        range: 180,
        attackSpeed: 0.5,
        cost: 200,
        upgradeCost: 300,
        specialAbility: 'queue_damage',
      },
      database: {
        type: 'database',
        level: 1,
        damage: 20,
        range: 100,
        attackSpeed: 0.8,
        cost: 180,
        upgradeCost: 270,
        specialAbility: 'high_damage',
      },
      monitoring: {
        type: 'monitoring',
        level: 1,
        damage: 3,
        range: 200,
        attackSpeed: 3,
        cost: 80,
        upgradeCost: 120,
        specialAbility: 'reveal',
      },
    };

    return towerConfigs[type];
  }

  /**
   * Update tower logic (called every frame)
   */
  update(time: number, delta: number): void {
    // Check if can attack
    const attackCooldown = 1000 / this.towerData.attackSpeed;
    if (time - this.lastAttackTime >= attackCooldown) {
      this.tryAttack(time);
    }
  }

  /**
   * Try to find and attack an enemy
   */
  private tryAttack(time: number): void {
    // TODO: Find enemies in range
    // TODO: Fire projectile at enemy
    // For now, just update last attack time
    this.lastAttackTime = time;
  }

  /**
   * Show range indicator
   */
  showRange(): void {
    if (this.rangeCircle) return;

    this.rangeCircle = this.scene.add.graphics();
    this.rangeCircle.lineStyle(2, 0x00ff00, 0.5);
    this.rangeCircle.strokeCircle(this.x, this.y, this.towerData.range);
  }

  /**
   * Hide range indicator
   */
  hideRange(): void {
    if (this.rangeCircle) {
      this.rangeCircle.destroy();
      this.rangeCircle = undefined;
    }
  }

  /**
   * Upgrade tower
   */
  upgrade(): void {
    this.towerData.level++;
    this.towerData.damage *= 1.5;
    this.towerData.range *= 1.1;
    this.towerData.attackSpeed *= 1.2;

    // Update visual
    this.towerSprite.setFillStyle(0x00ff00, 1);
    console.log(`Tower upgraded to level ${this.towerData.level}`);
  }

  /**
   * Get tower data
   */
  getData(): TowerData {
    return { ...this.towerData };
  }

  /**
   * Cleanup
   */
  destroy(fromScene?: boolean): void {
    this.hideRange();
    super.destroy(fromScene);
  }
}

