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

    // Background
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.9);
    bg.setOrigin(0, 0);

    // Game Over text
    const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
      font: 'bold 64px Arial',
      color: '#ff0000',
    });
    gameOverText.setOrigin(0.5);

    // Error budget depleted message
    const message = this.add.text(width / 2, height / 3 + 80, 
      '❌ Error Budget Depleted\nYour infrastructure collapsed!', {
      font: '24px Arial',
      color: theme.textColor,
      align: 'center',
    });
    message.setOrigin(0.5);

    // Score
    const scoreText = this.add.text(width / 2, height / 2, `Final Score: ${state.score}`, {
      font: 'bold 32px Arial',
      color: theme.buttonColor,
    });
    scoreText.setOrigin(0.5);

    // Try to save score
    await this.saveScore(state.score);

    // Buttons
    this.createButton(width / 2, height / 2 + 100, 'TRY AGAIN', () => this.retry());
    this.createButton(width / 2, height / 2 + 180, 'MAIN MENU', () => this.returnToMenu());
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

    const bg = this.add.rectangle(0, 0, 300, 50, parseInt(theme.buttonColor.replace('#', '0x'), 16));
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      font: 'bold 20px Arial',
      color: theme.buttonTextColor,
    });
    label.setOrigin(0.5);

    const button = this.add.container(x, y, [bg, label]);

    bg.on('pointerover', () => button.setScale(1.05));
    bg.on('pointerout', () => button.setScale(1));
    bg.on('pointerdown', onClick);
  }

  private retry(): void {
    this.scene.stop(SCENES.UI);
    this.scene.start(SCENES.GAME);
    this.scene.launch(SCENES.UI);
  }

  private returnToMenu(): void {
    gameManager.reset();
    this.scene.stop(SCENES.UI);
    this.scene.start(SCENES.MAIN_MENU);
  }
}

