/**
 * PauseScene - Pause menu overlay
 */

import Phaser from 'phaser';
import { SCENES } from '../config/game.config';
import { gameManager } from '../game/GameManager';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PAUSE });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const theme = {
      buttonColor: '#4CAF50',
      buttonTextColor: '#ffffff',
    };

    // Semi-transparent overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0, 0);
    overlay.setDepth(0);

    // Pause text
    const pauseText = this.add.text(width / 2, height / 3, 'PAUSED', {
      font: 'bold 48px Arial',
      color: theme.buttonColor,
      stroke: '#000000',
      strokeThickness: 4,
    });
    pauseText.setOrigin(0.5);
    pauseText.setDepth(10);

    // Resume button
    this.createButton(width / 2, height / 2, 'RESUME', () => this.resumeGame());

    // Main menu button
    this.createButton(width / 2, height / 2 + 80, 'MAIN MENU', () => this.returnToMenu());

    // ESC to resume
    this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
  }

  private createButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const theme = {
      buttonColor: '#4CAF50',
      buttonTextColor: '#ffffff',
    };

    // Button shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.5);
    shadow.fillRoundedRect(-150 + 3, -25 + 3, 300, 50, 12);

    // Button background with gradient
    const bg = this.add.graphics();
    bg.fillStyle(parseInt(theme.buttonColor.replace('#', '0x'), 16), 1);
    bg.fillRoundedRect(-150, -25, 300, 50, 12);
    
    // Inner highlight
    bg.fillStyle(0xffffff, 0.15);
    bg.fillRoundedRect(-145, -20, 290, 15, 10);
    
    // Border
    bg.lineStyle(2, 0xffffff, 0.3);
    bg.strokeRoundedRect(-150, -25, 300, 50, 12);

    // Interactive area
    const hitArea = this.add.rectangle(0, 0, 300, 50, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });

    // Button text with shadow
    const labelShadow = this.add.text(1, 1, text, {
      font: 'bold 20px Arial',
      color: '#000000',
    });
    labelShadow.setOrigin(0.5);
    labelShadow.setAlpha(0.5);

    const label = this.add.text(0, 0, text, {
      font: 'bold 20px Arial',
      color: theme.buttonTextColor,
    });
    label.setOrigin(0.5);

    // Container
    const button = this.add.container(x, y, [shadow, bg, hitArea, labelShadow, label]);
    button.setDepth(10);

    // Hover effects
    hitArea.on('pointerover', () => {
      this.tweens.add({
        targets: button,
        scale: 1.05,
        duration: 150,
        ease: 'Back.easeOut',
      });
    });

    hitArea.on('pointerout', () => {
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
      });
    });

    hitArea.on('pointerdown', () => {
      this.tweens.add({
        targets: button,
        scale: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: onClick,
      });
    });

    return button;
  }

  private resumeGame(): void {
    gameManager.resume();
    this.scene.stop();
    this.scene.resume(SCENES.GAME);
  }

  private returnToMenu(): void {
    gameManager.reset();
    this.scene.stop(SCENES.UI);
    this.scene.stop(SCENES.GAME);
    this.scene.stop();
    this.scene.start(SCENES.MAIN_MENU);
  }
}

