/**
 * VictoryScene - Victory screen
 */

import Phaser from 'phaser';
import { SCENES } from '../config/game.config';
import { gameManager } from '../game/GameManager';
import { telegram } from '../telegram/telegram';
import { supabase } from '../supabase/client';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.VICTORY });
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

    // Add semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x001a00, 0.7); // Dark green tint for victory
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1);

    // Victory text with effects
    const victoryShadow = this.add.text(width / 2 + 4, height / 4 + 4, 'VICTORY!', {
      font: 'bold 72px Arial',
      color: '#000000',
    });
    victoryShadow.setOrigin(0.5);
    victoryShadow.setAlpha(0.7);
    victoryShadow.setDepth(10);
    
    const victoryGlow = this.add.text(width / 2, height / 4, 'VICTORY!', {
      font: 'bold 72px Arial',
      color: theme.buttonColor,
      stroke: theme.buttonColor,
      strokeThickness: 20,
    });
    victoryGlow.setOrigin(0.5);
    victoryGlow.setAlpha(0.3);
    victoryGlow.setDepth(10);
    
    const victoryText = this.add.text(width / 2, height / 4, 'VICTORY!', {
      font: 'bold 72px Arial',
      color: theme.buttonColor,
      stroke: '#000000',
      strokeThickness: 6,
    });
    victoryText.setOrigin(0.5);
    victoryText.setDepth(10);

    // Congratulations message with panel
    const messagePanel = this.add.graphics();
    messagePanel.fillStyle(0x000000, 0.7);
    messagePanel.fillRoundedRect(width / 2 - 280, height / 4 + 70, 560, 80, 12);
    messagePanel.lineStyle(2, parseInt(theme.buttonColor.replace('#', '0x'), 16), 0.8);
    messagePanel.strokeRoundedRect(width / 2 - 280, height / 4 + 70, 560, 80, 12);
    messagePanel.setDepth(10);
    
    const message = this.add.text(width / 2, height / 4 + 110, 
      '🎉 Infrastructure Protected!\nAll incidents handled successfully!', {
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
    scorePanel.fillRoundedRect(width / 2 - 250, height / 2 - 75, 500, 90, 15);
    scorePanel.lineStyle(3, parseInt(theme.buttonColor.replace('#', '0x'), 16), 1);
    scorePanel.strokeRoundedRect(width / 2 - 250, height / 2 - 75, 500, 90, 15);
    scorePanel.setDepth(10);
    
    const scoreText = this.add.text(width / 2, height / 2 - 30, 
      `⭐ Final Score: ${state.score}\n❤️ Error Budget: ${state.errorBudget}`, {
      font: 'bold 28px Arial',
      color: theme.buttonColor,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4,
    });
    scoreText.setOrigin(0.5);
    scoreText.setDepth(10);

    // Try to save score
    await this.saveScore(state.score);

    // Buttons
    this.createButton(width / 2, height / 2 + 60, 'NEXT LEVEL', () => this.nextLevel());
    this.createButton(width / 2, height / 2 + 140, 'MAIN MENU', () => this.returnToMenu());

    // Celebration animations
    this.tweens.add({
      targets: [victoryGlow],
      scale: 1.05,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    this.tweens.add({
      targets: victoryText,
      scale: 1.05,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
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

  private nextLevel(): void {
    console.log('🎮 Restarting level...');
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

