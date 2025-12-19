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

    // Add background image
    const bg = this.add.image(0, 0, 'game_background');
    bg.setOrigin(0, 0);
    
    // Scale to fit screen
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    bg.setDepth(0);

    // Add dark overlay to make text more readable
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1);

    // Get theme
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    // Title with effects
    const titleShadow = this.add.text(width / 2 + 4, height / 4 + 4, 'INFRA DEFENDER', {
      font: 'bold 64px Arial',
      color: '#000000',
    });
    titleShadow.setOrigin(0.5);
    titleShadow.setAlpha(0.5);
    titleShadow.setDepth(10);
    
    const titleGlow = this.add.text(width / 2, height / 4, 'INFRA DEFENDER', {
      font: 'bold 64px Arial',
      color: theme.buttonColor,
      stroke: theme.buttonColor,
      strokeThickness: 15,
    });
    titleGlow.setOrigin(0.5);
    titleGlow.setAlpha(0.3);
    titleGlow.setDepth(10);
    
    const title = this.add.text(width / 2, height / 4, 'INFRA DEFENDER', {
      font: 'bold 64px Arial',
      color: theme.buttonColor,
      stroke: '#000000',
      strokeThickness: 6,
    });
    title.setOrigin(0.5);
    title.setDepth(10);
    
    // Pulsing animation
    this.tweens.add({
      targets: [titleGlow],
      scale: 1.05,
      alpha: 0.4,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle with panel
    const subtitlePanel = this.add.graphics();
    subtitlePanel.fillStyle(0x0a0a0a, 0.7);
    subtitlePanel.fillRoundedRect(width / 2 - 180, height / 4 + 54, 360, 36, 18);
    subtitlePanel.lineStyle(2, parseInt(theme.buttonColor.replace('#', '0x'), 16), 0.5);
    subtitlePanel.strokeRoundedRect(width / 2 - 180, height / 4 + 54, 360, 36, 18);
    subtitlePanel.setDepth(10);
    
    const subtitle = this.add.text(width / 2, height / 4 + 72, '🛡️ Protect Your Infrastructure!', {
      font: 'bold 20px Arial',
      color: theme.textColor,
      stroke: '#000000',
      strokeThickness: 3,
    });
    subtitle.setOrigin(0.5);
    subtitle.setDepth(10);

    // User greeting
    const user = telegram.getUser();
    if (user) {
      const greeting = this.add.text(width / 2, height / 4 + 110, `Welcome, ${user.firstName}!`, {
        font: '20px Arial',
        color: theme.hintColor,
      });
      greeting.setOrigin(0.5);
      greeting.setDepth(10);
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
    version.setDepth(10);

    console.log('🏠 MainMenuScene: Ready');
  }

  private createButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

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

  private startGame(): void {
    console.log('🎮 Starting game...');
    
    // Start both game and UI scenes
    this.scene.start(SCENES.GAME);
    this.scene.launch(SCENES.UI);
  }
}

