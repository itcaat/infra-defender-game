/**
 * Game-related TypeScript types and interfaces
 */

// Player Profile
export interface PlayerProfile {
  id: string; // Telegram user ID or UUID
  telegram_id?: number;
  username?: string;
  first_name: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
  total_score: number;
  games_played: number;
  games_won: number;
  highest_level: number;
  total_playtime: number; // in seconds
  achievements: string[]; // achievement IDs
}

// Game Session
export interface GameSession {
  id: string;
  player_id: string;
  level_id: number;
  score: number;
  waves_completed: number;
  towers_placed: number;
  enemies_defeated: number;
  error_budget_remaining: number;
  started_at: string;
  completed_at?: string;
  duration: number; // in seconds
  victory: boolean;
  game_data?: Record<string, any>; // Additional game state
}

// Leaderboard Entry
export interface LeaderboardEntry {
  id: string;
  player_id: string;
  player_name: string;
  player_username?: string;
  score: number;
  level_id: number;
  achieved_at: string;
  rank?: number;
}

// Level Configuration
export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'nightmare';
  starting_money: number;
  starting_error_budget: number;
  total_waves: number;
  unlocked_by_level?: number;
}

// Tower Type
export type TowerType = 'nginx' | 'prometheus' | 'api_gateway' | 'redis' | 'kafka' | 'postgresql' | 'clickhouse';

// Enemy Type
export type EnemyType = 'traffic_spike' | 'ddos' | 'memory_leak' | 'slow_query' | 'friday_deploy';

// Achievement
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked_at?: string;
}

// Meta Progression (unlocks)
export interface MetaProgress {
  player_id: string;
  unlocked_towers: TowerType[];
  unlocked_levels: number[];
  unlocked_abilities: string[];
  experience_points: number;
  level: number;
}

