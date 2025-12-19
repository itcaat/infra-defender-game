/**
 * PauseScene - Pause menu overlay
 */

import Phaser from 'phaser';
import { SCENES } from '../config/game.config';
import { gameManager } from '../game/GameManager';
import { telegram } from '../telegram/telegram';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PAUSE });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    // Semi-transparent overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0, 0);

    // Pause text
    const pauseText = this.add.text(width / 2, height / 3, 'PAUSED', {
      font: 'bold 48px Arial',
      color: theme.buttonColor,
    });
    pauseText.setOrigin(0.5);

    // Resume button
    this.createButton(width / 2, height / 2, 'RESUME', () => this.resumeGame());

    // Main menu button
    this.createButton(width / 2, height / 2 + 80, 'MAIN MENU', () => this.returnToMenu());

    // ESC to resume
    this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
  }

  private createButton(x: number, y: number, text: string, onClick: () => void): void {
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    const bg = this.add.rectangle(0, 0, 250, 50, parseInt(theme.buttonColor.replace('#', '0x'), 16));
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      font: 'bold 20px Arial',
      color: theme.buttonTextColor,
    });
    label.setOrigin(0.5);

    const button = this.add.container(x, y, [bg, label]);

    bg.on('pointerover', () => {
      bg.setFillStyle(parseInt(theme.buttonColor.replace('#', '0x'), 16), 0.8);
      button.setScale(1.05);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(parseInt(theme.buttonColor.replace('#', '0x'), 16), 1);
      button.setScale(1);
    });

    bg.on('pointerdown', onClick);
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

