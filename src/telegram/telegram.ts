/**
 * Telegram Mini Apps Integration
 * Handles Telegram WebApp API initialization and utilities
 */

import {
  retrieveLaunchParams,
} from '@tma.js/sdk';

export interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isPremium?: boolean;
  photoUrl?: string;
}

export interface TelegramTheme {
  bgColor: string;
  textColor: string;
  hintColor: string;
  linkColor: string;
  buttonColor: string;
  buttonTextColor: string;
  secondaryBgColor: string;
}

export class TelegramIntegration {
  private static instance: TelegramIntegration;
  private initialized = false;
  private isTelegramEnvironment = false;
  private user: TelegramUser | null = null;
  private theme: TelegramTheme | null = null;
  private initDataRaw: string | null = null;

  private constructor() {}

  static getInstance(): TelegramIntegration {
    if (!TelegramIntegration.instance) {
      TelegramIntegration.instance = new TelegramIntegration();
    }
    return TelegramIntegration.instance;
  }

  /**
   * Initialize Telegram Mini Apps SDK
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️ Telegram integration already initialized');
      return;
    }

    try {
      // Try to retrieve launch parameters
      let launchParams;
      try {
        launchParams = retrieveLaunchParams();
      } catch (e) {
        // Not in Telegram environment - this is expected when running in browser
        console.log('ℹ️ Not running in Telegram environment (browser mode)');
        this.isTelegramEnvironment = false;
        this.initialized = true;
        return;
      }
      
      if (!launchParams) {
        console.log('ℹ️ Not running in Telegram environment');
        this.isTelegramEnvironment = false;
        this.initialized = true;
        return;
      }

      this.isTelegramEnvironment = true;

      // Get user from init data
      if ((launchParams as any).initData && (launchParams as any).initData.user) {
        const tgUser = (launchParams as any).initData.user;
        this.user = {
          id: tgUser.id,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
          languageCode: tgUser.language_code,
          isPremium: tgUser.is_premium,
          photoUrl: tgUser.photo_url,
        };
      }

      // Get theme from platform
      if ((launchParams as any).themeParams) {
        const tp = (launchParams as any).themeParams;
        this.theme = {
          bgColor: tp.bgColor || '#000000',
          textColor: tp.textColor || '#ffffff',
          hintColor: tp.hintColor || '#999999',
          linkColor: tp.linkColor || '#00ff00',
          buttonColor: tp.buttonColor || '#00ff00',
          buttonTextColor: tp.buttonTextColor || '#000000',
          secondaryBgColor: tp.secondaryBgColor || '#1a1a1a',
        };
      }

      // Store raw init data
      if ((launchParams as any).initDataRaw) {
        this.initDataRaw = (launchParams as any).initDataRaw;
      }

      this.initialized = true;
      
      console.log('✅ Telegram Mini Apps SDK initialized');
      console.log('👤 User:', this.user);
      console.log('🎨 Theme:', this.theme);
      
    } catch (error) {
      console.error('❌ Failed to initialize Telegram SDK:', error);
      this.isTelegramEnvironment = false;
      this.initialized = true;
    }
  }

  /**
   * Check if running in Telegram environment
   */
  isTelegram(): boolean {
    return this.isTelegramEnvironment;
  }

  /**
   * Get current Telegram user
   */
  getUser(): TelegramUser | null {
    return this.user;
  }

  /**
   * Get Telegram theme
   */
  getTheme(): TelegramTheme | null {
    return this.theme;
  }

  /**
   * Get raw init data for backend authentication
   */
  getInitDataRaw(): string | null {
    return this.initDataRaw;
  }

  /**
   * Show native Telegram alert
   */
  showAlert(message: string): void {
    if (this.isTelegramEnvironment && window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.showAlert(message);
    } else {
      alert(message);
    }
  }

  /**
   * Show native Telegram confirm dialog
   */
  async showConfirm(message: string): Promise<boolean> {
    if (this.isTelegramEnvironment && window.Telegram && window.Telegram.WebApp) {
      return new Promise((resolve) => {
        window.Telegram!.WebApp!.showConfirm(message, resolve);
      });
    } else {
      return confirm(message);
    }
  }

  /**
   * Get default theme for non-Telegram environment
   */
  getDefaultTheme(): TelegramTheme {
    return {
      bgColor: '#2d2d2d',
      textColor: '#ffffff',
      hintColor: '#999999',
      linkColor: '#00ff00',
      buttonColor: '#00ff00',
      buttonTextColor: '#000000',
      secondaryBgColor: '#1a1a1a',
    };
  }
}

// Extend Window interface for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        showAlert: (message: string) => void;
        showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
      };
    };
  }
}

// Export singleton instance
export const telegram = TelegramIntegration.getInstance();
