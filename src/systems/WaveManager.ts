/**
 * WaveManager - Manages enemy waves and spawning
 */

import type { WaveConfig, EnemyType } from '../types/phaser.types';
import { GAME_CONFIG } from '../config/game.config';

export class WaveManager {
  private waves: WaveConfig[];
  private currentWaveIndex: number = -1;
  private isWaveActive: boolean = false;
  private enemiesSpawned: number = 0;
  private enemiesAlive: number = 0;
  private spawnTimer: number = 0;
  private currentEnemyTypeIndex: number = 0;
  private currentEnemyCount: number = 0;

  constructor(waves: WaveConfig[]) {
    this.waves = waves;
  }

  /**
   * Start the next wave
   */
  startNextWave(): boolean {
    if (this.isWaveActive) {
      return false;
    }

    if (this.currentWaveIndex >= this.waves.length - 1) {
      return false; // No more waves
    }

    this.currentWaveIndex++;
    this.isWaveActive = true;
    this.enemiesSpawned = 0;
    this.currentEnemyTypeIndex = 0;
    this.currentEnemyCount = 0;
    this.spawnTimer = 0;

    console.log(`🌊 Starting wave ${this.currentWaveIndex + 1}/${this.waves.length}`);
    return true;
  }

  /**
   * Update wave spawning logic
   */
  update(delta: number, onSpawnEnemy: (type: EnemyType) => void): void {
    if (!this.isWaveActive) return;

    const wave = this.waves[this.currentWaveIndex];
    if (!wave) return;

    // Check if all enemies of current type are spawned
    if (this.currentEnemyTypeIndex >= wave.enemies.length) {
      // Wave complete when all spawned and none alive
      if (this.enemiesAlive === 0) {
        this.completeWave();
      }
      return;
    }

    const currentEnemyConfig = wave.enemies[this.currentEnemyTypeIndex];

    // Update spawn timer
    this.spawnTimer += delta;

    // Check if it's time to spawn
    if (this.spawnTimer >= currentEnemyConfig.interval) {
      this.spawnTimer = 0;

      // Spawn enemy
      onSpawnEnemy(currentEnemyConfig.type);
      this.currentEnemyCount++;
      this.enemiesSpawned++;
      this.enemiesAlive++;

      // Check if all enemies of this type are spawned
      if (this.currentEnemyCount >= currentEnemyConfig.count) {
        this.currentEnemyTypeIndex++;
        this.currentEnemyCount = 0;
      }
    }
  }

  /**
   * Notify that an enemy died
   */
  onEnemyKilled(): void {
    this.enemiesAlive = Math.max(0, this.enemiesAlive - 1);
  }

  /**
   * Notify that an enemy reached the end
   */
  onEnemyReachedEnd(): void {
    this.enemiesAlive = Math.max(0, this.enemiesAlive - 1);
  }

  /**
   * Complete current wave
   */
  private completeWave(): void {
    this.isWaveActive = false;
    const wave = this.waves[this.currentWaveIndex];
    console.log(`✅ Wave ${this.currentWaveIndex + 1} completed! Reward: ${wave.reward}`);
  }

  /**
   * Check if wave is active
   */
  isActive(): boolean {
    return this.isWaveActive;
  }

  /**
   * Get current wave number (1-indexed)
   */
  getCurrentWave(): number {
    return this.currentWaveIndex + 1;
  }

  /**
   * Get total waves
   */
  getTotalWaves(): number {
    return this.waves.length;
  }

  /**
   * Check if all waves completed
   */
  isAllWavesComplete(): boolean {
    return this.currentWaveIndex >= this.waves.length - 1 && 
           !this.isWaveActive && 
           this.enemiesAlive === 0;
  }

  /**
   * Get wave reward
   */
  getWaveReward(): number {
    const wave = this.waves[this.currentWaveIndex];
    return wave ? wave.reward : 0;
  }
}

