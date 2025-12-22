/**
 * UserManager - Manages user profile without Telegram
 */

const STORAGE_KEY = 'infra_defender_user';

export interface UserProfile {
  nickname: string;
  createdAt: number;
}

export class UserManager {
  private static instance: UserManager;
  private profile: UserProfile | null = null;

  private constructor() {
    this.loadProfile();
  }

  static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  /**
   * Load user profile from localStorage
   */
  private loadProfile(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        this.profile = JSON.parse(stored);
        console.log('👤 User loaded:', this.profile?.nickname);
      } catch (error) {
        console.error('Failed to parse user profile:', error);
        this.profile = null;
      }
    }
  }

  /**
   * Check if user has a profile
   */
  hasProfile(): boolean {
    return this.profile !== null;
  }

  /**
   * Get current user profile
   */
  getProfile(): UserProfile | null {
    return this.profile;
  }

  /**
   * Get user nickname
   */
  getNickname(): string {
    return this.profile?.nickname || 'Guest';
  }

  /**
   * Set user nickname and save profile
   */
  setNickname(nickname: string): void {
    const trimmed = nickname.trim();
    if (!trimmed || trimmed.length < 2) {
      throw new Error('Nickname must be at least 2 characters');
    }
    if (trimmed.length > 20) {
      throw new Error('Nickname must be at most 20 characters');
    }

    this.profile = {
      nickname: trimmed,
      createdAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    console.log('✅ User profile saved:', trimmed);
  }

  /**
   * Clear user profile
   */
  clearProfile(): void {
    this.profile = null;
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ User profile cleared');
  }
}

// Export singleton instance
export const userManager = UserManager.getInstance();


