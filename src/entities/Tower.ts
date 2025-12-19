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

    // Create visual representation with better graphics
    // Base shadow
    const shadow = scene.add.ellipse(0, 5, 56, 20, 0x000000, 0.3);
    this.add(shadow);

    // Tower base (darker rectangle)
    const base = scene.add.rectangle(0, 5, 52, 52, 0x1a1a1a);
    base.setStrokeStyle(2, 0x00ff00);
    this.add(base);

    // Tower main body (gradient effect using multiple rectangles)
    this.towerSprite = scene.add.rectangle(0, 0, 48, 48, 0x2a4a2a);
    this.towerSprite.setStrokeStyle(2, 0x00ff00);
    this.add(this.towerSprite);

    // Inner glow
    const glow = scene.add.rectangle(0, 0, 44, 44, 0x3a6a3a);
    this.add(glow);

    // Top highlight
    const highlight = scene.add.rectangle(0, -8, 36, 10, 0x4a8a4a, 0.8);
    this.add(highlight);

    // Add icon - use image if available, otherwise emoji
    if (desc.iconImage) {
      const iconKey = `icon_${towerType}`;
      
      // Check if image is loaded
      if (scene.textures.exists(iconKey)) {
        const iconImage = scene.add.image(0, 0, iconKey);
        iconImage.setDisplaySize(32, 32);
        this.add(iconImage);
      } else {
        // Fallback to colored letter
        const iconBg = scene.add.circle(0, 0, 16, parseInt(desc.iconColor?.replace('#', '0x') || '0x00ff00', 16));
        this.add(iconBg);
        
        const fallbackIcon = scene.add.text(0, 0, desc.name.charAt(0), {
          font: 'bold 20px Arial',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2,
        });
        fallbackIcon.setOrigin(0.5);
        this.add(fallbackIcon);
      }
    } else {
      // Fallback to emoji
      const icon = scene.add.text(0, 0, desc.icon, {
        font: '32px Arial',
        stroke: '#000000',
        strokeThickness: 3,
      });
      icon.setOrigin(0.5);
      this.add(icon);
    }

    // Add level badge
    const levelBadge = scene.add.circle(18, -18, 12, 0x000000, 0.8);
    levelBadge.setStrokeStyle(2, 0xffaa00);
    this.add(levelBadge);

    const levelText = scene.add.text(18, -18, `${this.towerData.level}`, {
      font: 'bold 14px Arial',
      color: '#ffaa00',
    });
    levelText.setOrigin(0.5);
    this.add(levelText);

    // Add to scene
    scene.add.existing(this);

    // Make interactive
    this.setSize(48, 48);
    this.setInteractive();

    // Spawn animation - fade in only
    this.setAlpha(0);
    scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 300,
      ease: 'Quad.easeOut',
    });

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
  update(time: number, _delta: number, enemies: any[]): void {
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
      // Skip inactive or dead enemies
      if (!enemy.active || enemy.getData().health <= 0) return;

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
    
    // Draw filled circle with gradient effect
    this.rangeCircle.fillStyle(0x00ff00, 0.1);
    this.rangeCircle.fillCircle(this.x, this.y, this.towerData.range);
    
    // Draw dashed border
    this.rangeCircle.lineStyle(3, 0x00ff00, 0.6);
    
    // Draw dashed circle
    const steps = 32;
    for (let i = 0; i < steps; i++) {
      if (i % 2 === 0) {
        const angle1 = (i / steps) * Math.PI * 2;
        const angle2 = ((i + 1) / steps) * Math.PI * 2;
        const x1 = this.x + Math.cos(angle1) * this.towerData.range;
        const y1 = this.y + Math.sin(angle1) * this.towerData.range;
        const x2 = this.x + Math.cos(angle2) * this.towerData.range;
        const y2 = this.y + Math.sin(angle2) * this.towerData.range;
        this.rangeCircle.lineBetween(x1, y1, x2, y2);
      }
    }
    
    this.rangeCircle.setDepth(this.depth - 1);
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

