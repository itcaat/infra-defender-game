/**
 * Supabase client and database operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';
import type {
  PlayerProfile,
  GameSession,
  LeaderboardEntry,
  MetaProgress,
} from '../types/game.types';

export class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient | null = null;
  private mockMode: boolean = false;
  private mockData: {
    profile: PlayerProfile | null;
    sessions: GameSession[];
    leaderboard: LeaderboardEntry[];
  } = {
    profile: null,
    sessions: [],
    leaderboard: [],
  };

  private constructor() {}

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Initialize Supabase client
   */
  initialize(): void {
    const config = getSupabaseConfig();
    this.mockMode = config.mockMode;

    if (!this.mockMode) {
      this.client = createClient(config.url, config.anonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
      console.log('✅ Supabase client initialized');
    } else {
      console.log('🧪 Supabase mock client initialized');
      this.initializeMockData();
    }
  }

  /**
   * Initialize mock data for offline development
   */
  private initializeMockData(): void {
    // Create a default mock player profile
    this.mockData.profile = {
      id: 'mock-player-1',
      telegram_id: 123456789,
      username: 'test_user',
      first_name: 'Test',
      last_name: 'Player',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_score: 0,
      games_played: 0,
      games_won: 0,
      highest_level: 1,
      total_playtime: 0,
      achievements: [],
    };

    // Create mock leaderboard entries
    this.mockData.leaderboard = [
      {
        id: 'lb-1',
        player_id: 'player-1',
        player_name: 'DevOps Master',
        player_username: 'devops_master',
        score: 15000,
        level_id: 5,
        achieved_at: new Date(Date.now() - 86400000).toISOString(),
        rank: 1,
      },
      {
        id: 'lb-2',
        player_id: 'player-2',
        player_name: 'SRE Hero',
        player_username: 'sre_hero',
        score: 12000,
        level_id: 4,
        achieved_at: new Date(Date.now() - 172800000).toISOString(),
        rank: 2,
      },
      {
        id: 'lb-3',
        player_id: 'player-3',
        player_name: 'Cloud Ninja',
        player_username: 'cloud_ninja',
        score: 10000,
        level_id: 4,
        achieved_at: new Date(Date.now() - 259200000).toISOString(),
        rank: 3,
      },
    ];
  }

  /**
   * Get or create player profile
   */
  async getOrCreateProfile(telegramId: number, userData: {
    username?: string;
    firstName: string;
    lastName?: string;
  }): Promise<PlayerProfile | null> {
    if (this.mockMode) {
      // Return or update mock profile
      if (this.mockData.profile) {
        this.mockData.profile.telegram_id = telegramId;
        this.mockData.profile.username = userData.username;
        this.mockData.profile.first_name = userData.firstName;
        this.mockData.profile.last_name = userData.lastName;
      }
      return this.mockData.profile;
    }

    try {
      // Check if profile exists
      const { data: existing, error: fetchError } = await this.client!
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (existing) {
        return existing as PlayerProfile;
      }

      // Create new profile
      const newProfile: Partial<PlayerProfile> = {
        telegram_id: telegramId,
        username: userData.username,
        first_name: userData.firstName,
        last_name: userData.lastName,
        total_score: 0,
        games_played: 0,
        games_won: 0,
        highest_level: 1,
        total_playtime: 0,
        achievements: [],
      };

      const { data, error } = await this.client!
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      return data as PlayerProfile;
    } catch (error) {
      console.error('Error in getOrCreateProfile:', error);
      return null;
    }
  }

  /**
   * Save game session
   */
  async saveGameSession(session: Omit<GameSession, 'id'>): Promise<GameSession | null> {
    if (this.mockMode) {
      const mockSession: GameSession = {
        id: `session-${Date.now()}`,
        ...session,
      };
      this.mockData.sessions.push(mockSession);
      console.log('🧪 Mock: Game session saved', mockSession);
      return mockSession;
    }

    try {
      const { data, error } = await this.client!
        .from('game_sessions')
        .insert(session)
        .select()
        .single();

      if (error) {
        console.error('Error saving game session:', error);
        return null;
      }

      return data as GameSession;
    } catch (error) {
      console.error('Error in saveGameSession:', error);
      return null;
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(levelId?: number, limit: number = 100): Promise<LeaderboardEntry[]> {
    if (this.mockMode) {
      let entries = [...this.mockData.leaderboard];
      if (levelId) {
        entries = entries.filter(e => e.level_id === levelId);
      }
      return entries.slice(0, limit);
    }

    try {
      let query = this.client!
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (levelId) {
        query = query.eq('level_id', levelId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      return (data as LeaderboardEntry[]) || [];
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      return [];
    }
  }

  /**
   * Submit score to leaderboard
   */
  async submitScore(
    playerId: string,
    playerName: string,
    playerUsername: string | undefined,
    score: number,
    levelId: number
  ): Promise<boolean> {
    if (this.mockMode) {
      const entry: LeaderboardEntry = {
        id: `lb-${Date.now()}`,
        player_id: playerId,
        player_name: playerName,
        player_username: playerUsername,
        score,
        level_id: levelId,
        achieved_at: new Date().toISOString(),
      };
      this.mockData.leaderboard.push(entry);
      this.mockData.leaderboard.sort((a, b) => b.score - a.score);
      console.log('🧪 Mock: Score submitted to leaderboard', entry);
      return true;
    }

    try {
      const { error } = await this.client!
        .from('leaderboard')
        .insert({
          player_id: playerId,
          player_name: playerName,
          player_username: playerUsername,
          score,
          level_id: levelId,
          achieved_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error submitting score:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in submitScore:', error);
      return false;
    }
  }

  /**
   * Check if using mock mode
   */
  isMockMode(): boolean {
    return this.mockMode;
  }

  /**
   * Get Supabase client (for advanced operations)
   */
  getClient(): SupabaseClient | null {
    return this.client;
  }
}

// Export singleton instance
export const supabase = SupabaseService.getInstance();

