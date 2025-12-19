/**
 * Phaser-specific TypeScript types
 */

import type { TowerType, EnemyType } from './game.types';

// Grid position
export interface GridPosition {
  x: number; // Grid column
  y: number; // Grid row
}

// World position (in pixels)
export interface WorldPosition {
  x: number;
  y: number;
}

// Tower data
export interface TowerData {
  type: TowerType;
  level: number;
  damage: number;
  range: number;
  attackSpeed: number; // attacks per second
  cost: number;
  upgradeCost: number;
  specialAbility?: string;
}

// Enemy data
export interface EnemyData {
  type: EnemyType;
  health: number;
  maxHealth: number;
  speed: number;
  errorBudgetDamage: number; // How much error budget it costs if it reaches the end
  reward: number; // Money gained on kill
  specialBehavior?: string;
}

// Wave configuration
export interface WaveConfig {
  waveNumber: number;
  enemies: Array<{
    type: EnemyType;
    count: number;
    interval: number; // ms between spawns
  }>;
  reward: number; // Bonus money for completing wave
}

// Level data
export interface LevelData {
  id: number;
  name: string;
  description: string;
  gridWidth: number;
  gridHeight: number;
  spawnPoints: GridPosition[];
  targetPoints: GridPosition[];
  paths: GridPosition[][]; // Multiple possible paths
  buildableArea: GridPosition[];
  waves: WaveConfig[];
  startingMoney: number;
  startingErrorBudget: number;
}

// Game state
export interface GameState {
  money: number;
  errorBudget: number;
  currentWave: number;
  totalWaves: number;
  score: number;
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;
}

