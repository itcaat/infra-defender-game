/**
 * GameOverScene - Game over screen
 */

import Phaser from 'phaser';
import { SCENES } from '../config/game.config';
import { gameManager } from '../game/GameManager';
import { telegram } from '../telegram/telegram';
import { supabase } from '../supabase/client';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME_OVER });
  }

  async create(): Promise<void> {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    const state = gameManager.getState();

    // Add background image
    const bgImage = this.add.image(0, 0, 'game_background');
    bgImage.setOrigin(0, 0);
    
    // Scale to fit screen
    const scaleX = width / bgImage.width;
    const scaleY = height / bgImage.height;
    const scale = Math.max(scaleX, scaleY);
    bgImage.setScale(scale);
    bgImage.setDepth(0);

    // Add dark red overlay for dramatic effect
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1);

    // Game Over text with effects
    const gameOverShadow = this.add.text(width / 2 + 4, height / 4 + 4, 'GAME OVER', {
      font: 'bold 72px Arial',
      color: '#000000',
    });
    gameOverShadow.setOrigin(0.5);
    gameOverShadow.setAlpha(0.7);
    gameOverShadow.setDepth(10);
    
    const gameOverGlow = this.add.text(width / 2, height / 4, 'GAME OVER', {
      font: 'bold 72px Arial',
      color: '#ff0000',
      stroke: '#ff0000',
      strokeThickness: 20,
    });
    gameOverGlow.setOrigin(0.5);
    gameOverGlow.setAlpha(0.3);
    gameOverGlow.setDepth(10);
    
    const gameOverText = this.add.text(width / 2, height / 4, 'GAME OVER', {
      font: 'bold 72px Arial',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6,
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(10);
    
    // Pulsing animation
    this.tweens.add({
      targets: [gameOverGlow],
      scale: 1.05,
      alpha: 0.4,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Error budget depleted message with panel
    const messagePanel = this.add.graphics();
    messagePanel.fillStyle(0x000000, 0.7);
    messagePanel.fillRoundedRect(width / 2 - 250, height / 4 + 70, 500, 80, 12);
    messagePanel.lineStyle(2, 0xff0000, 0.8);
    messagePanel.strokeRoundedRect(width / 2 - 250, height / 4 + 70, 500, 80, 12);
    messagePanel.setDepth(10);
    
    const message = this.add.text(width / 2, height / 4 + 110, 
      '❌ Error Budget Depleted\nYour infrastructure collapsed!', {
      font: 'bold 20px Arial',
      color: theme.textColor,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3,
    });
    message.setOrigin(0.5);
    message.setDepth(10);

    // Score panel
    const scorePanel = this.add.graphics();
    scorePanel.fillStyle(0x000000, 0.8);
    scorePanel.fillRoundedRect(width / 2 - 200, height / 2 - 60, 400, 70, 15);
    scorePanel.lineStyle(3, parseInt(theme.buttonColor.replace('#', '0x'), 16), 1);
    scorePanel.strokeRoundedRect(width / 2 - 200, height / 2 - 60, 400, 70, 15);
    scorePanel.setDepth(10);
    
    const scoreText = this.add.text(width / 2, height / 2 - 25, `⭐ Final Score: ${state.score}`, {
      font: 'bold 32px Arial',
      color: theme.buttonColor,
      stroke: '#000000',
      strokeThickness: 5,
    });
    scoreText.setOrigin(0.5);
    scoreText.setDepth(10);

    // Try to save score
    await this.saveScore(state.score);

    // Buttons
    this.createButton(width / 2, height / 2 + 60, 'TRY AGAIN', () => this.retry());
    this.createButton(width / 2, height / 2 + 140, 'MAIN MENU', () => this.returnToMenu());
  }

  private async saveScore(score: number): Promise<void> {
    const user = telegram.getUser();
    if (!user) return;

    try {
      await supabase.submitScore(
        user.id.toString(),
        user.firstName,
        user.username,
        score,
        1 // Level ID
      );
      console.log('✅ Score saved to leaderboard');
    } catch (error) {
      console.error('❌ Failed to save score:', error);
    }
  }

  private createButton(x: number, y: number, text: string, onClick: () => void): void {
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    // Button shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.6);
    shadow.fillRoundedRect(-150 + 3, -25 + 3, 300, 50, 12);

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(parseInt(theme.buttonColor.replace('#', '0x'), 16), 1);
    bg.fillRoundedRect(-150, -25, 300, 50, 12);
    
    bg.fillStyle(0xffffff, 0.15);
    bg.fillRoundedRect(-145, -20, 290, 15, 10);
    
    bg.lineStyle(2, 0xffffff, 0.3);
    bg.strokeRoundedRect(-150, -25, 300, 50, 12);

    const hitArea = this.add.rectangle(0, 0, 300, 50, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      font: 'bold 20px Arial',
      color: theme.buttonTextColor,
      stroke: '#000000',
      strokeThickness: 3,
    });
    label.setOrigin(0.5);

    const button = this.add.container(x, y, [shadow, bg, hitArea, label]);
    button.setDepth(10);

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
    
    hitArea.on('pointerdown', onClick);
  }

  private retry(): void {
    gameManager.reset();
    this.scene.stop(SCENES.UI);
    this.scene.stop();
    this.scene.start(SCENES.GAME);
    this.scene.launch(SCENES.UI);
  }

  private returnToMenu(): void {
    gameManager.reset();
    this.scene.stop(SCENES.UI);
    this.scene.stop();
    this.scene.start(SCENES.MAIN_MENU);
  }
}

