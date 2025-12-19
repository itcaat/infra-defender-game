/**
 * UIScene - Game UI overlay
 */

import Phaser from 'phaser';
import { SCENES, COLORS } from '../config/game.config';
import { gameManager } from '../game/GameManager';
import { telegram } from '../telegram/telegram';

export class UIScene extends Phaser.Scene {
  private moneyText!: Phaser.GameObjects.Text;
  private errorBudgetText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENES.UI });
  }

  create(): void {
    console.log('🖥️ UIScene: Creating UI...');

    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    // Top panel background
    const topPanel = this.add.rectangle(0, 0, this.cameras.main.width, 60, 
      parseInt(theme.secondaryBgColor.replace('#', '0x'), 16));
    topPanel.setOrigin(0, 0);
    topPanel.setAlpha(0.9);

    // Create UI elements
    this.createTopBar();

    // Listen to game state changes
    this.setupGameStateListeners();

    // Update initial values
    this.updateUI();

    console.log('✅ UIScene: Ready');
  }

  private createTopBar(): void {
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    const padding = 20;
    const y = 30;

    // Money
    this.moneyText = this.add.text(padding, y, '💰 Money: 0', {
      font: 'bold 20px Arial',
      color: theme.textColor,
    });
    this.moneyText.setOrigin(0, 0.5);

    // Error Budget
    this.errorBudgetText = this.add.text(padding + 200, y, '❤️ Error Budget: 0', {
      font: 'bold 20px Arial',
      color: theme.textColor,
    });
    this.errorBudgetText.setOrigin(0, 0.5);

    // Wave
    this.waveText = this.add.text(padding + 450, y, '🌊 Wave: 0/0', {
      font: 'bold 20px Arial',
      color: theme.textColor,
    });
    this.waveText.setOrigin(0, 0.5);

    // Score
    this.scoreText = this.add.text(this.cameras.main.width - padding, y, '⭐ Score: 0', {
      font: 'bold 20px Arial',
      color: theme.textColor,
    });
    this.scoreText.setOrigin(1, 0.5);
  }

  private setupGameStateListeners(): void {
    gameManager.on('money:changed', () => this.updateUI());
    gameManager.on('errorBudget:changed', () => this.updateUI());
    gameManager.on('wave:started', () => this.updateUI());
    gameManager.on('score:changed', () => this.updateUI());
    gameManager.on('game:initialized', () => this.updateUI());
  }

  private updateUI(): void {
    const state = gameManager.getState();

    this.moneyText.setText(`💰 Money: ${state.money}`);
    this.errorBudgetText.setText(`❤️ Error Budget: ${state.errorBudget}`);
    this.waveText.setText(`🌊 Wave: ${state.currentWave}/${state.totalWaves}`);
    this.scoreText.setText(`⭐ Score: ${state.score}`);

    // Color coding for error budget
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    if (state.errorBudget < 30) {
      this.errorBudgetText.setColor('#ff0000');
    } else if (state.errorBudget < 60) {
      this.errorBudgetText.setColor('#ff9800');
    } else {
      this.errorBudgetText.setColor(theme.textColor);
    }
  }
}

