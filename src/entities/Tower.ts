/**
 * Tower - Base class for all tower entities
 */

import Phaser from 'phaser';
import type { TowerType, TowerData } from '../types/phaser.types';
import { TOWER_CONFIGS, TOWER_DESCRIPTIONS } from '../config/towers.config';

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

    // Get tower data from config
    this.towerData = { ...TOWER_CONFIGS[towerType] };

    const desc = TOWER_DESCRIPTIONS[towerType];

    // Create visual representation (placeholder)
    this.towerSprite = scene.add.rectangle(0, 0, 48, 48, 0x00ff00);
    this.add(this.towerSprite);

    // Add icon
    const icon = scene.add.text(0, 0, desc.icon, {
      font: '32px Arial',
    });
    icon.setOrigin(0.5);
    this.add(icon);

    // Add level indicator
    const levelText = scene.add.text(0, -30, `Lv${this.towerData.level}`, {
      font: 'bold 12px Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 },
    });
    levelText.setOrigin(0.5);
    this.add(levelText);

    // Add to scene
    scene.add.existing(this);

    // Make interactive
    this.setSize(48, 48);
    this.setInteractive();

    // Hover effects
    this.on('pointerover', () => {
      this.towerSprite.setAlpha(0.7);
      this.showRange();
    });

    this.on('pointerout', () => {
      this.towerSprite.setAlpha(1);
      this.hideRange();
    });

    // Click handler (will be connected by scene)
    this.on('pointerdown', () => {
      this.scene.events.emit('tower:selected', this);
    });
  }

  /**
   * Update tower logic (called every frame)
   */
  update(time: number, delta: number, enemies: any[]): void {
    // Check if can attack
    const attackCooldown = 1000 / this.towerData.attackSpeed;
    if (time - this.lastAttackTime >= attackCooldown) {
      this.tryAttack(time, enemies);
    }
  }

  /**
   * Try to find and attack an enemy
   */
  private tryAttack(time: number, enemies: any[]): void {
    // Find closest enemy in range
    const target = this.findTarget(enemies);
    
    if (target) {
      this.attack(target);
      this.lastAttackTime = time;
    }
  }

  /**
   * Find closest enemy in range
   */
  private findTarget(enemies: any[]): any | null {
    let closestEnemy: any | null = null;
    let closestDistance = this.towerData.range;

    enemies.forEach(enemy => {
      if (enemy.getData().health <= 0) return;

      const distance = Phaser.Math.Distance.Between(
        this.x, this.y,
        enemy.x, enemy.y
      );

      if (distance <= closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    return closestEnemy;
  }

  /**
   * Attack an enemy
   */
  private attack(target: any): void {
    // Emit event to spawn projectile (scene will handle this)
    this.scene.events.emit('tower:attack', {
      tower: this,
      target: target,
      damage: this.towerData.damage,
    });
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
    this.towerData.cost += this.towerData.upgradeCost;
    this.towerData.upgradeCost = Math.round(this.towerData.upgradeCost * 1.5);

    // Update visual
    const scale = 1 + (this.towerData.level - 1) * 0.15;
    this.setScale(scale);
    
    // Update level text
    const levelText = this.list.find(obj => obj.type === 'Text') as Phaser.GameObjects.Text;
    if (levelText) {
      levelText.setText(`Lv${this.towerData.level}`);
    }

    // Flash effect
    this.scene.tweens.add({
      targets: this.towerSprite,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2,
    });

    console.log(`✨ Tower upgraded to level ${this.towerData.level}`);
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

