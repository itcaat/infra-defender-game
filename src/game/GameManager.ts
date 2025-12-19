/**
 * GameManager - Central game state and logic coordinator
 */

import { EventEmitter } from '../utils/EventEmitter';
import type { GameState, LevelData } from '../types/phaser.types';
import { GAME_CONFIG } from '../config/game.config';

export class GameManager extends EventEmitter {
  private static instance: GameManager;
  private gameState: GameState;
  private currentLevel: LevelData | null = null;

  private constructor() {
    super();
    this.gameState = this.createInitialState();
  }

  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  private createInitialState(): GameState {
    return {
      money: GAME_CONFIG.STARTING_MONEY,
      errorBudget: GAME_CONFIG.STARTING_ERROR_BUDGET,
      currentWave: 0,
      totalWaves: 0,
      score: 0,
      isPaused: false,
      isGameOver: false,
      isVictory: false,
    };
  }

  /**
   * Initialize game with level data
   */
  initializeGame(level: LevelData): void {
    this.currentLevel = level;
    this.gameState = {
      money: level.startingMoney,
      errorBudget: level.startingErrorBudget,
      currentWave: 0,
      totalWaves: level.waves.length,
      score: 0,
      isPaused: false,
      isGameOver: false,
      isVictory: false,
    };
    this.emit('game:initialized', this.gameState);
  }

  /**
   * Get current game state
   */
  getState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Get current level
   */
  getLevel(): LevelData | null {
    return this.currentLevel;
  }

  /**
   * Add money
   */
  addMoney(amount: number): void {
    this.gameState.money += amount;
    this.emit('money:changed', this.gameState.money);
  }

  /**
   * Spend money (returns false if insufficient funds)
   */
  spendMoney(amount: number): boolean {
    if (this.gameState.money >= amount) {
      this.gameState.money -= amount;
      this.emit('money:changed', this.gameState.money);
      return true;
    }
    return false;
  }

  /**
   * Damage error budget
   */
  damageErrorBudget(amount: number): void {
    this.gameState.errorBudget = Math.max(0, this.gameState.errorBudget - amount);
    this.emit('errorBudget:changed', this.gameState.errorBudget);

    if (this.gameState.errorBudget <= 0) {
      this.triggerGameOver();
    }
  }

  /**
   * Add to score
   */
  addScore(points: number): void {
    this.gameState.score += points;
    this.emit('score:changed', this.gameState.score);
  }

  /**
   * Start next wave
   */
  startNextWave(): void {
    if (this.gameState.currentWave < this.gameState.totalWaves) {
      this.gameState.currentWave++;
      this.emit('wave:started', this.gameState.currentWave);
    }
  }

  /**
   * Complete current wave
   */
  completeWave(): void {
    this.emit('wave:completed', this.gameState.currentWave);
    
    if (this.gameState.currentWave >= this.gameState.totalWaves) {
      this.triggerVictory();
    }
  }

  /**
   * Pause game
   */
  pause(): void {
    this.gameState.isPaused = true;
    this.emit('game:paused');
  }

  /**
   * Resume game
   */
  resume(): void {
    this.gameState.isPaused = false;
    this.emit('game:resumed');
  }

  /**
   * Trigger game over
   */
  private triggerGameOver(): void {
    this.gameState.isGameOver = true;
    this.emit('game:over', this.gameState.score);
  }

  /**
   * Trigger victory
   */
  private triggerVictory(): void {
    this.gameState.isVictory = true;
    this.emit('game:victory', this.gameState.score);
  }

  /**
   * Reset game state
   */
  reset(): void {
    this.gameState = this.createInitialState();
    this.currentLevel = null;
    this.emit('game:reset');
  }
}

// Export singleton instance
export const gameManager = GameManager.getInstance();

