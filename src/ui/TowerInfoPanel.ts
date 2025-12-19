/**
 * TowerInfoPanel - Shows info about selected tower with upgrade option
 */

import Phaser from 'phaser';
import type { Tower } from '../entities/Tower';
import { telegram } from '../telegram/telegram';
import { TOWER_DESCRIPTIONS } from '../config/towers.config';

export class TowerInfoPanel extends Phaser.GameObjects.Container {
  private tower: Tower | null = null;
  private background: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;
  private statsText: Phaser.GameObjects.Text;
  private upgradeButton: Phaser.GameObjects.Container;
  private sellButton: Phaser.GameObjects.Container;
  private closeButton: Phaser.GameObjects.Container;
  private onUpgrade: (tower: Tower) => void;
  private onSell: (tower: Tower) => void;

  constructor(
    scene: Phaser.Scene,
    onUpgrade: (tower: Tower) => void,
    onSell: (tower: Tower) => void
  ) {
    super(scene, 0, 0);
    this.onUpgrade = onUpgrade;
    this.onSell = onSell;

    this.createPanel();
    this.setVisible(false);
    scene.add.existing(this);
  }

  private createPanel(): void {
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    const width = 250;
    const height = 280;
    const x = this.scene.cameras.main.width - width - 20;
    const y = 80;

    this.setPosition(x, y);
    this.setDepth(150);

    // Background
    this.background = this.scene.add.rectangle(0, 0, width, height,
      parseInt(theme.secondaryBgColor.replace('#', '0x'), 16), 0.95);
    this.background.setStrokeStyle(2, parseInt(theme.buttonColor.replace('#', '0x'), 16));
    this.add(this.background);

    // Title
    const title = this.scene.add.text(-width/2 + 10, -height/2 + 10, 'Tower Info', {
      font: 'bold 18px Arial',
      color: theme.textColor,
    });
    this.add(title);

    // Close button
    this.closeButton = this.createButton(width/2 - 25, -height/2 + 15, '✕', 30, 30, () => this.hide());
    this.add(this.closeButton);

    // Name
    this.nameText = this.scene.add.text(0, -height/2 + 50, '', {
      font: 'bold 20px Arial',
      color: theme.buttonColor,
      align: 'center',
    });
    this.nameText.setOrigin(0.5, 0);
    this.add(this.nameText);

    // Stats
    this.statsText = this.scene.add.text(-width/2 + 15, -height/2 + 85, '', {
      font: '14px Arial',
      color: theme.textColor,
      lineSpacing: 5,
    });
    this.add(this.statsText);

    // Upgrade button
    this.upgradeButton = this.createButton(0, height/2 - 70, 'Upgrade', 120, 40, () => this.handleUpgrade());
    this.add(this.upgradeButton);

    // Sell button
    this.sellButton = this.createButton(0, height/2 - 25, 'Sell', 120, 40, () => this.handleSell());
    this.add(this.sellButton);
  }

  private createButton(
    x: number, 
    y: number, 
    text: string, 
    width: number, 
    height: number, 
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    const bg = this.scene.add.rectangle(0, 0, width, height,
      parseInt(theme.buttonColor.replace('#', '0x'), 16));
    bg.setInteractive({ useHandCursor: true });

    const label = this.scene.add.text(0, 0, text, {
      font: 'bold 16px Arial',
      color: theme.buttonTextColor,
    });
    label.setOrigin(0.5);

    const button = this.scene.add.container(x, y, [bg, label]);

    bg.on('pointerover', () => bg.setAlpha(0.8));
    bg.on('pointerout', () => bg.setAlpha(1));
    bg.on('pointerdown', onClick);

    return button;
  }

  show(tower: Tower): void {
    this.tower = tower;
    this.updateInfo();
    this.setVisible(true);

    // Animate in
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 200,
    });
  }

  hide(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.setVisible(false);
        this.tower = null;
      }
    });
  }

  private updateInfo(): void {
    if (!this.tower) return;

    const data = this.tower.getData();
    const desc = TOWER_DESCRIPTIONS[data.type];

    // Update name with icon
    this.nameText.setText(`${desc.icon} ${desc.name} Lv${data.level}`);

    // Update stats
    const stats = [
      `Damage: ${Math.round(data.damage)}`,
      `Range: ${Math.round(data.range)}`,
      `Attack Speed: ${data.attackSpeed.toFixed(1)}/s`,
      ``,
      `Upgrade Cost: 💰${data.upgradeCost}`,
      `Sell Value: 💰${Math.round(data.cost * 0.7)}`,
    ];
    this.statsText.setText(stats.join('\n'));

    // Update button labels
    const upgradeLabel = this.upgradeButton.list[1] as Phaser.GameObjects.Text;
    upgradeLabel.setText(`Upgrade (💰${data.upgradeCost})`);

    const sellLabel = this.sellButton.list[1] as Phaser.GameObjects.Text;
    sellLabel.setText(`Sell (💰${Math.round(data.cost * 0.7)})`);
  }

  private handleUpgrade(): void {
    if (this.tower) {
      this.onUpgrade(this.tower);
      this.updateInfo();
    }
  }

  private handleSell(): void {
    if (this.tower) {
      this.onSell(this.tower);
      this.hide();
    }
  }

  getTower(): Tower | null {
    return this.tower;
  }

  isVisible(): boolean {
    return this.visible;
  }
}

