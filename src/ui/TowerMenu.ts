/**
 * TowerMenu - UI for selecting towers to place
 */

import Phaser from 'phaser';
import type { TowerType } from '../types/phaser.types';
import { TOWER_CONFIGS, TOWER_DESCRIPTIONS } from '../config/towers.config';
import { telegram } from '../telegram/telegram';

export class TowerMenu extends Phaser.GameObjects.Container {
  private selectedTower: TowerType | null = null;
  private buttons: Map<TowerType, Phaser.GameObjects.Container> = new Map();
  private onTowerSelected: (tower: TowerType | null) => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    onTowerSelected: (tower: TowerType | null) => void
  ) {
    super(scene, x, y);
    this.onTowerSelected = onTowerSelected;

    this.createMenu();
    scene.add.existing(this);
  }

  private createMenu(): void {
    // Create tower buttons without background panel
    const towerTypes: TowerType[] = ['nginx', 'load_balancer', 'redis', 'kafka', 'postgresql', 'prometheus'];
    const buttonWidth = 90;
    const startX = -270; // Center the buttons
    const startY = 0;

    towerTypes.forEach((towerType, index) => {
      const x = startX + index * (buttonWidth + 5);
      const button = this.createTowerButton(towerType, x, startY);
      this.buttons.set(towerType, button);
    });
  }

  private createTowerButton(towerType: TowerType, x: number, y: number): Phaser.GameObjects.Container {
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    const config = TOWER_CONFIGS[towerType];
    const desc = TOWER_DESCRIPTIONS[towerType];

    // Button shadow
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillRoundedRect(-42.5 + 2, -40 + 2, 85, 80, 10);
    
    // Button background with better styling
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a1a, 1);
    bg.fillRoundedRect(-42.5, -40, 85, 80, 10);
    
    bg.fillStyle(0x2a2a2a, 0.9);
    bg.fillRoundedRect(-42.5 + 3, -40 + 3, 79, 74, 8);
    
    // Interactive area
    const hitArea = this.scene.add.rectangle(0, 0, 85, 80, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });

    // Icon - use image if available
    let icon: Phaser.GameObjects.GameObject;
    const iconKey = `icon_${towerType}`;
    
    if (this.scene.textures.exists(iconKey)) {
      const iconImage = this.scene.add.image(0, -20, iconKey);
      iconImage.setDisplaySize(28, 28);
      icon = iconImage;
    } else {
      // Fallback to emoji
      const iconText = this.scene.add.text(0, -20, desc.icon, {
        font: '28px Arial',
      });
      iconText.setOrigin(0.5);
      icon = iconText;
    }

    // Cost
    const cost = this.scene.add.text(0, 15, `💰${config.cost}`, {
      font: 'bold 12px Arial',
      color: theme.textColor,
    });
    cost.setOrigin(0.5);

    // Name (shortened)
    const name = this.scene.add.text(0, 30, desc.name.substring(0, 8), {
      font: '10px Arial',
      color: theme.hintColor,
    });
    name.setOrigin(0.5);

    const button = this.scene.add.container(x, y, [shadow, bg, hitArea, icon, cost, name]);
    this.add(button);

    // Hover effects
    hitArea.on('pointerover', () => {
      this.scene.tweens.add({
        targets: button,
        scale: 1.08,
        duration: 150,
        ease: 'Back.easeOut',
      });
    });

    hitArea.on('pointerout', () => {
      if (this.selectedTower !== towerType) {
        this.scene.tweens.add({
          targets: button,
          scale: 1,
          duration: 150,
        });
      }
    });

    hitArea.on('pointerdown', () => {
      this.selectTower(towerType);
    });

    return button;
  }


  private selectTower(towerType: TowerType | null): void {
    // Reset previous selection
    this.buttons.forEach((button, type) => {
      const bg = button.list[1] as Phaser.GameObjects.Graphics;
      if (type === towerType) {
        // Selected state
        bg.clear();
        bg.fillStyle(0x1a1a1a, 1);
        bg.fillRoundedRect(-42.5, -40, 85, 80, 10);
        
        bg.fillStyle(0x1a4a1a, 1);
        bg.fillRoundedRect(-42.5 + 3, -40 + 3, 79, 74, 8);
      } else {
        // Normal state
        bg.clear();
        bg.fillStyle(0x1a1a1a, 1);
        bg.fillRoundedRect(-42.5, -40, 85, 80, 10);
        
        bg.fillStyle(0x2a2a2a, 0.9);
        bg.fillRoundedRect(-42.5 + 3, -40 + 3, 79, 74, 8);
        
        button.setScale(1);
      }
    });

    this.selectedTower = towerType;
    this.onTowerSelected(towerType);
  }

  getSelectedTower(): TowerType | null {
    return this.selectedTower;
  }

  clearSelection(): void {
    this.selectTower(null);
  }
}

