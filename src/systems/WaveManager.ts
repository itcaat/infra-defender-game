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
  private nextSpawnInterval: number = 0;

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
    this.nextSpawnInterval = this.getRandomInterval();

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
    if (this.spawnTimer >= this.nextSpawnInterval) {
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
        // Add a longer pause between enemy types
        this.nextSpawnInterval = currentEnemyConfig.interval * (1.5 + Math.random());
      } else {
        // Random interval for next spawn
        this.nextSpawnInterval = this.getRandomInterval(currentEnemyConfig.interval);
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

  /**
   * Get random interval with variance for natural spawning
   */
  private getRandomInterval(baseInterval: number = 1000): number {
    // 20% chance for group spawn (very short interval)
    if (Math.random() < 0.2) {
      return baseInterval * (0.2 + Math.random() * 0.3); // 20-50% of base
    }
    
    // 80% chance for normal spawn with variance
    return baseInterval * (0.6 + Math.random() * 0.8); // 60-140% of base
  }
}

