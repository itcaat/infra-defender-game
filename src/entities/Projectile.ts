/**
 * Projectile - Projectiles fired by towers
 */

import Phaser from 'phaser';
import type { Enemy } from './Enemy';

export class Projectile extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Arc;
  private target: Enemy;
  private damage: number;
  private speed: number = 400; // pixels per second

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Enemy,
    damage: number,
    color: number = 0xffff00
  ) {
    super(scene, x, y);

    this.target = target;
    this.damage = damage;

    // Create projectile visual (simple circle)
    this.sprite = scene.add.circle(0, 0, 6, color);
    this.add(this.sprite);

    // Add glow effect
    this.sprite.setStrokeStyle(2, color, 0.5);

    scene.add.existing(this);
  }

  /**
   * Update projectile movement towards target
   */
  update(delta: number): boolean {
    // Check if target is still alive
    if (!this.target || this.target.getData().health <= 0) {
      this.destroy();
      return false;
    }

    // Move towards target
    const targetX = this.target.x;
    const targetY = this.target.y;

    const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
    const moveAmount = (this.speed * delta) / 1000;

    if (distance <= moveAmount) {
      // Hit target
      this.hitTarget();
      return false;
    }

    // Move towards target
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    this.x += Math.cos(angle) * moveAmount;
    this.y += Math.sin(angle) * moveAmount;

    return true;
  }

  /**
   * Hit the target
   */
  private hitTarget(): void {
    if (this.target && this.target.getData().health > 0) {
      this.target.takeDamage(this.damage);
    }
    this.destroy();
  }

  /**
   * Get target
   */
  getTarget(): Enemy {
    return this.target;
  }
}

