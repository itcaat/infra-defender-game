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
  api_gateway: {
    type: 'api_gateway',
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
  postgresql: {
    type: 'postgresql',
    level: 1,
    damage: 20,
    range: 100,
    attackSpeed: 0.8,
    cost: 180,
    upgradeCost: 270,
    specialAbility: 'high_damage',
  },
  prometheus: {
    type: 'prometheus',
    level: 1,
    damage: 3,
    range: 200,
    attackSpeed: 3,
    cost: 80,
    upgradeCost: 120,
    specialAbility: 'reveal',
  },
  clickhouse: {
    type: 'clickhouse',
    level: 1,
    damage: 12,
    range: 160,
    attackSpeed: 1.2,
    cost: 160,
    upgradeCost: 240,
    specialAbility: 'analytics',
  },
};

// Tower descriptions for UI
export interface TowerDescription {
  name: string;
  description: string;
  icon: string;
  iconImage?: string;
  iconColor?: string;
}

export const TOWER_DESCRIPTIONS: Record<TowerType, TowerDescription> = {
  nginx: {
    name: 'Nginx',
    description: 'Fast rate limiting. Good vs traffic spikes.',
    icon: '🔵',
    iconImage: 'icons/nginx.svg',
    iconColor: '#009639',
  },
  api_gateway: {
    name: 'API Gateway',
    description: 'Routes requests, buffs nearby towers.',
    icon: '🚪',
    iconImage: 'icons/api-gateway.svg',
    iconColor: '#FF9900',
  },
  redis: {
    name: 'Redis Cache',
    description: 'Slows enemies. Moderate damage.',
    icon: '🔴',
    iconImage: 'icons/redis.svg',
    iconColor: '#DC382D',
  },
  kafka: {
    name: 'Kafka Queue',
    description: 'High damage, slow attacks. Long range.',
    icon: '📨',
    iconImage: 'icons/kafka.svg',
    iconColor: '#231F20',
  },
  postgresql: {
    name: 'PostgreSQL',
    description: 'Very high damage. Short range.',
    icon: '🗄️',
    iconImage: 'icons/postgresql.svg',
    iconColor: '#336791',
  },
  prometheus: {
    name: 'Prometheus',
    description: 'Reveals enemy info. Very fast, low damage.',
    icon: '📊',
    iconImage: 'icons/prometheus.svg',
    iconColor: '#E6522C',
  },
  clickhouse: {
    name: 'ClickHouse',
    description: 'Analytics database. Good damage, good range.',
    icon: '🗂️',
    iconImage: 'icons/clickhouse.svg',
    iconColor: '#FFCC00',
  },
};

