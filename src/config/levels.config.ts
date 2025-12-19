/**
 * Level configurations
 */

import type { LevelData } from '../types/phaser.types';

import type { DecorType } from '../types/phaser.types';

// Add your custom levels here
// Copy JSON from Level Editor and paste it here
export const CUSTOM_LEVELS: Record<number, {
  spawnPoints: Array<{ x: number; y: number }>;
  targetPoints: Array<{ x: number; y: number }>;
  paths: Array<Array<{ x: number; y: number }>>;
  decorations?: Array<{ type: DecorType; position: { x: number; y: number } }>;
}> = {
  // Example: Uncomment and modify this, or add your own from editor:
  /*
  1: {
    spawnPoints: [{ x: 0, y: 2 }],
    targetPoints: [{ x: 10, y: 5 }],
    paths: [
      [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 4, y: 3 },
        { x: 4, y: 4 },
        { x: 4, y: 5 },
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 7, y: 5 },
        { x: 8, y: 5 },
        { x: 9, y: 5 },
        { x: 10, y: 5 },
      ]
    ]
  },
  */
  
  // Add more levels:
  // 2: { ... },
  // 3: { ... },
};

/**
 * Create full level data from custom level config
 */
export function createLevelFromConfig(
  levelId: number,
  config: typeof CUSTOM_LEVELS[number]
): LevelData {
  return {
    id: levelId,
    name: `Level ${levelId}`,
    description: 'Custom level',
    gridWidth: 20,
    gridHeight: 11,
    spawnPoints: config.spawnPoints,
    targetPoints: config.targetPoints,
    paths: config.paths,
    decorations: config.decorations || [],
    buildableArea: [],
    waves: [
      {
        waveNumber: 1,
        enemies: [
          { type: 'traffic_spike', count: 6, interval: 1000 },
        ],
        reward: 100,
      },
      {
        waveNumber: 2,
        enemies: [
          { type: 'traffic_spike', count: 4, interval: 800 },
          { type: 'memory_leak', count: 3, interval: 1500 },
        ],
        reward: 150,
      },
      {
        waveNumber: 3,
        enemies: [
          { type: 'ddos', count: 4, interval: 1000 },
          { type: 'traffic_spike', count: 5, interval: 600 },
        ],
        reward: 200,
      },
      {
        waveNumber: 4,
        enemies: [
          { type: 'memory_leak', count: 4, interval: 1200 },
          { type: 'slow_query', count: 2, interval: 2000 },
        ],
        reward: 250,
      },
      {
        waveNumber: 5,
        enemies: [
          { type: 'ddos', count: 5, interval: 900 },
          { type: 'memory_leak', count: 3, interval: 1300 },
          { type: 'slow_query', count: 2, interval: 1800 },
        ],
        reward: 300,
      },
      {
        waveNumber: 6,
        enemies: [
          { type: 'friday_deploy', count: 1, interval: 3000 },
          { type: 'ddos', count: 6, interval: 800 },
          { type: 'traffic_spike', count: 7, interval: 500 },
        ],
        reward: 400,
      },
    ],
    startingMoney: 500,
    startingErrorBudget: 100,
  };
}

