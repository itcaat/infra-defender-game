/**
 * MainMenuScene - Main menu and level selection
 */

import Phaser from 'phaser';
import { SCENES, COLORS } from '../config/game.config';
import { telegram } from '../telegram/telegram';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MAIN_MENU });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Get theme
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    // Title
    const title = this.add.text(width / 2, height / 4, 'INFRA DEFENDER', {
      font: 'bold 64px Arial',
      color: theme.buttonColor,
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 4 + 70, 'Protect Your Infrastructure!', {
      font: '24px Arial',
      color: theme.textColor,
    });
    subtitle.setOrigin(0.5);

    // User greeting
    const user = telegram.getUser();
    if (user) {
      const greeting = this.add.text(width / 2, height / 4 + 110, `Welcome, ${user.firstName}!`, {
        font: '20px Arial',
        color: theme.hintColor,
      });
      greeting.setOrigin(0.5);
    }

    // Start button
    const startButton = this.createButton(
      width / 2,
      height / 2 + 50,
      'START GAME',
      () => this.startGame()
    );

    // Leaderboard button
    const leaderboardButton = this.createButton(
      width / 2,
      height / 2 + 130,
      'LEADERBOARD',
      () => console.log('Leaderboard - Coming soon!')
    );

    // Settings button
    const settingsButton = this.createButton(
      width / 2,
      height / 2 + 210,
      'SETTINGS',
      () => console.log('Settings - Coming soon!')
    );

    // Version info
    const version = this.add.text(width - 10, height - 10, 'v0.0.1 - MVP', {
      font: '14px Arial',
      color: theme.hintColor,
    });
    version.setOrigin(1, 1);

    console.log('🏠 MainMenuScene: Ready');
  }

  private createButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    // Button background
    const bg = this.add.rectangle(0, 0, 300, 50, parseInt(theme.buttonColor.replace('#', '0x'), 16));
    bg.setInteractive({ useHandCursor: true });

    // Button text
    const label = this.add.text(0, 0, text, {
      font: 'bold 20px Arial',
      color: theme.buttonTextColor,
    });
    label.setOrigin(0.5);

    // Container
    const button = this.add.container(x, y, [bg, label]);

    // Hover effects
    bg.on('pointerover', () => {
      bg.setFillStyle(parseInt(theme.buttonColor.replace('#', '0x'), 16), 0.8);
      this.tweens.add({
        targets: button,
        scale: 1.05,
        duration: 100,
      });
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(parseInt(theme.buttonColor.replace('#', '0x'), 16), 1);
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 100,
      });
    });

    bg.on('pointerdown', () => {
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

  private startGame(): void {
    console.log('🎮 Starting game...');
    
    // Start both game and UI scenes
    this.scene.start(SCENES.GAME);
    this.scene.launch(SCENES.UI);
  }
}

