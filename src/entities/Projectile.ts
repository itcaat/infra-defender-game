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

    // Create projectile visual with trail effect
    // Outer glow
    const outerGlow = scene.add.circle(0, 0, 10, color, 0.3);
    this.add(outerGlow);

    // Middle glow
    const middleGlow = scene.add.circle(0, 0, 7, color, 0.6);
    this.add(middleGlow);

    // Core
    this.sprite = scene.add.circle(0, 0, 5, 0xffffff);
    this.add(this.sprite);

    // Add pulsing animation - alpha only
    scene.tweens.add({
      targets: [outerGlow, middleGlow],
      alpha: 0.1,
      duration: 200,
      yoyo: true,
      repeat: -1,
    });

    // Trail effect - leave particles behind
    scene.time.addEvent({
      delay: 30,
      callback: () => {
        if (this.active) {
          const trail = scene.add.circle(this.x, this.y, 3, color, 0.6);
          scene.tweens.add({
            targets: trail,
            scale: 0,
            alpha: 0,
            duration: 200,
            onComplete: () => trail.destroy(),
          });
        }
      },
      loop: true,
    });

    scene.add.existing(this);
  }

  /**
   * Update projectile movement towards target
   */
  update(delta: number): boolean {
    // Check if target is still alive and active
    if (!this.target || !this.target.active || this.target.getData().health <= 0) {
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
      
      // Impact effect - burst of particles
      const color = this.sprite.fillColor;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        const particle = this.scene.add.circle(this.x, this.y, 2, color);
        this.scene.tweens.add({
          targets: particle,
          x: this.x + Math.cos(angle) * 15,
          y: this.y + Math.sin(angle) * 15,
          alpha: 0,
          duration: 200,
          ease: 'Quad.easeOut',
          onComplete: () => particle.destroy(),
        });
      }

      // Impact flash - fade only
      const flash = this.scene.add.circle(this.x, this.y, 16, 0xffffff, 0.8);
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 150,
        ease: 'Quad.easeOut',
        onComplete: () => flash.destroy(),
      });
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

