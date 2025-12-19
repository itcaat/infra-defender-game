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
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    // Background panel
    const panelWidth = 600;
    const panelHeight = 120;
    const panel = this.scene.add.rectangle(0, 0, panelWidth, panelHeight,
      parseInt(theme.secondaryBgColor.replace('#', '0x'), 16), 0.95);
    this.add(panel);

    // Title
    const title = this.scene.add.text(-panelWidth / 2 + 10, -panelHeight / 2 + 10,
      'Build Tower:', {
        font: 'bold 16px Arial',
        color: theme.textColor,
      });
    this.add(title);

    // Create tower buttons
    const towerTypes: TowerType[] = ['nginx', 'load_balancer', 'redis', 'kafka', 'database', 'monitoring'];
    const buttonWidth = 90;
    const startX = -panelWidth / 2 + 15;
    const startY = -10;

    towerTypes.forEach((towerType, index) => {
      const x = startX + index * (buttonWidth + 5);
      const button = this.createTowerButton(towerType, x, startY);
      this.buttons.set(towerType, button);
    });

    // Cancel button
    const cancelBtn = this.createCancelButton(panelWidth / 2 - 50, 0);
    this.add(cancelBtn);
  }

  private createTowerButton(towerType: TowerType, x: number, y: number): Phaser.GameObjects.Container {
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    const config = TOWER_CONFIGS[towerType];
    const desc = TOWER_DESCRIPTIONS[towerType];

    // Button background
    const bg = this.scene.add.rectangle(0, 0, 85, 80, 0x333333);
    bg.setStrokeStyle(2, 0x555555);
    bg.setInteractive({ useHandCursor: true });

    // Icon
    const icon = this.scene.add.text(0, -20, desc.icon, {
      font: '32px Arial',
    });
    icon.setOrigin(0.5);

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

    const button = this.scene.add.container(x, y, [bg, icon, cost, name]);
    this.add(button);

    // Hover effects
    bg.on('pointerover', () => {
      bg.setFillStyle(0x444444);
      bg.setScale(1.05);
    });

    bg.on('pointerout', () => {
      if (this.selectedTower !== towerType) {
        bg.setFillStyle(0x333333);
        bg.setScale(1);
      }
    });

    bg.on('pointerdown', () => {
      this.selectTower(towerType);
    });

    return button;
  }

  private createCancelButton(x: number, y: number): Phaser.GameObjects.Container {
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    const bg = this.scene.add.rectangle(0, 0, 80, 40,
      parseInt(theme.buttonColor.replace('#', '0x'), 16));
    bg.setInteractive({ useHandCursor: true });

    const label = this.scene.add.text(0, 0, 'Cancel', {
      font: 'bold 14px Arial',
      color: theme.buttonTextColor,
    });
    label.setOrigin(0.5);

    const button = this.scene.add.container(x, y, [bg, label]);

    bg.on('pointerover', () => bg.setAlpha(0.8));
    bg.on('pointerout', () => bg.setAlpha(1));
    bg.on('pointerdown', () => this.selectTower(null));

    return button;
  }

  private selectTower(towerType: TowerType | null): void {
    // Reset previous selection
    this.buttons.forEach((button, type) => {
      const bg = button.list[0] as Phaser.GameObjects.Rectangle;
      if (type === towerType) {
        bg.setFillStyle(0x00ff00);
        bg.setStrokeStyle(3, 0x00ff00);
      } else {
        bg.setFillStyle(0x333333);
        bg.setStrokeStyle(2, 0x555555);
        bg.setScale(1);
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

