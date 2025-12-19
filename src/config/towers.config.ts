/**
 * Tower configurations and definitions
 */

import type { TowerType, TowerData } from '../types/phaser.types';

export const TOWER_CONFIGS: Record<TowerType, TowerData> = {
  nginx: {
    type: 'nginx',
    level: 1,
    damage: 10,
    range: 150,
    attackSpeed: 1, // attacks per second
    cost: 100,
    upgradeCost: 150,
    specialAbility: 'rate_limit',
  },
  load_balancer: {
    type: 'load_balancer',
    level: 1,
    damage: 5,
    range: 120,
    attackSpeed: 2,
    cost: 150,
    upgradeCost: 200,
    specialAbility: 'area_buff',
  },
  redis: {
    type: 'redis',
    level: 1,
    damage: 8,
    range: 100,
    attackSpeed: 1.5,
    cost: 120,
    upgradeCost: 180,
    specialAbility: 'slow',
  },
  kafka: {
    type: 'kafka',
    level: 1,
    damage: 15,
    range: 180,
    attackSpeed: 0.5,
    cost: 200,
    upgradeCost: 300,
    specialAbility: 'queue_damage',
  },
  database: {
    type: 'database',
    level: 1,
    damage: 20,
    range: 100,
    attackSpeed: 0.8,
    cost: 180,
    upgradeCost: 270,
    specialAbility: 'high_damage',
  },
  monitoring: {
    type: 'monitoring',
    level: 1,
    damage: 3,
    range: 200,
    attackSpeed: 3,
    cost: 80,
    upgradeCost: 120,
    specialAbility: 'reveal',
  },
};

// Tower descriptions for UI
export const TOWER_DESCRIPTIONS: Record<TowerType, {
  name: string;
  description: string;
  icon: string;
}> = {
  nginx: {
    name: 'Nginx',
    description: 'Fast rate limiting. Good vs traffic spikes.',
    icon: '🔵',
  },
  load_balancer: {
    name: 'Load Balancer',
    description: 'Buffs nearby towers. Low damage.',
    icon: '⚖️',
  },
  redis: {
    name: 'Redis Cache',
    description: 'Slows enemies. Moderate damage.',
    icon: '🔴',
  },
  kafka: {
    name: 'Kafka Queue',
    description: 'High damage, slow attacks. Long range.',
    icon: '📨',
  },
  database: {
    name: 'Database',
    description: 'Very high damage. Short range.',
    icon: '🗄️',
  },
  monitoring: {
    name: 'Monitoring',
    description: 'Reveals enemy info. Very fast, low damage.',
    icon: '📊',
  },
};

