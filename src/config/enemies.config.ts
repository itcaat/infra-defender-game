/**
 * Enemy configurations and definitions
 */

import type { EnemyType, EnemyData } from '../types/phaser.types';

export const ENEMY_CONFIGS: Record<EnemyType, Omit<EnemyData, 'health' | 'maxHealth'> & { maxHealth: number }> = {
  traffic_spike: {
    type: 'traffic_spike',
    maxHealth: 50,
    speed: 100, // pixels per second
    errorBudgetDamage: 10,
    reward: 10,
  },
  ddos: {
    type: 'ddos',
    maxHealth: 100,
    speed: 150,
    errorBudgetDamage: 20,
    reward: 20,
  },
  memory_leak: {
    type: 'memory_leak',
    maxHealth: 80,
    speed: 60,
    errorBudgetDamage: 15,
    reward: 15,
    specialBehavior: 'grows_over_time',
  },
  slow_query: {
    type: 'slow_query',
    maxHealth: 120,
    speed: 40,
    errorBudgetDamage: 25,
    reward: 25,
    specialBehavior: 'slows_towers',
  },
  friday_deploy: {
    type: 'friday_deploy',
    maxHealth: 200,
    speed: 80,
    errorBudgetDamage: 50,
    reward: 50,
    specialBehavior: 'spawns_bugs',
  },
};

// Enemy descriptions for UI
export const ENEMY_DESCRIPTIONS: Record<EnemyType, {
  name: string;
  description: string;
  icon: string;
  color: number;
}> = {
  traffic_spike: {
    name: 'Traffic Spike',
    description: 'Fast and numerous. Basic threat.',
    icon: '📈',
    color: 0xff6b6b,
  },
  ddos: {
    name: 'DDoS Attack',
    description: 'Very fast and dangerous. High damage.',
    icon: '💥',
    color: 0xff0000,
  },
  memory_leak: {
    name: 'Memory Leak',
    description: 'Slow but grows stronger over time.',
    icon: '🔻',
    color: 0xffa500,
  },
  slow_query: {
    name: 'Slow Query',
    description: 'Tanks damage, slows nearby towers.',
    icon: '🐌',
    color: 0x9b59b6,
  },
  friday_deploy: {
    name: 'Friday Deploy',
    description: 'Boss enemy. Massive health and damage.',
    icon: '😱',
    color: 0x8b0000,
  },
};

