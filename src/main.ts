import Phaser from 'phaser';
import { telegram } from './telegram/telegram';
import { supabase } from './supabase/client';
import { GAME_CONFIG } from './config/game.config';

// Import all scenes
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { PauseScene } from './scenes/PauseScene';
import { GameOverScene } from './scenes/GameOverScene';
import { VictoryScene } from './scenes/VictoryScene';
import { LevelEditorScene } from './scenes/LevelEditorScene';

// Initialize Telegram and Supabase before starting the game
async function initializeApp() {
  console.log('🚀 Initializing Infra Defender...');
  
  // Initialize Telegram SDK
  await telegram.initialize();
  
  // Initialize Supabase
  supabase.initialize();
  
  // Get theme (from Telegram or default)
  const theme = telegram.isTelegram() 
    ? telegram.getTheme()! 
    : telegram.getDefaultTheme();
  
  console.log('🎨 Using theme:', theme);
  
  // Update body background to match Telegram theme
  document.body.style.backgroundColor = theme.bgColor;
  
  // Try to get or create player profile
  const user = telegram.getUser();
  if (user) {
    const profile = await supabase.getOrCreateProfile(user.id, {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    console.log('👤 Player profile:', profile);
  } else if (supabase.isMockMode()) {
    // In mock mode without Telegram, create a mock profile
    const profile = await supabase.getOrCreateProfile(123456789, {
      username: 'test_user',
      firstName: 'Test Player',
    });
    console.log('🧪 Mock player profile:', profile);
  }
  
  // Game configuration
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    parent: 'game-container',
    backgroundColor: theme.bgColor,
    scene: [
      BootScene,
      PreloadScene,
      MainMenuScene,
      GameScene,
      UIScene,
      PauseScene,
      GameOverScene,
      VictoryScene,
      LevelEditorScene,
    ],
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: GAME_CONFIG.DEBUG_MODE,
      }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  // Initialize Phaser game
  const game = new Phaser.Game(config);

  // Log environment info
  console.log('✅ Phaser 3 initialized successfully!');
  console.log('🎮 Infra Defender - Game structure ready');
  console.log('📱 Telegram environment:', telegram.isTelegram());
  console.log('🗄️ Supabase mode:', supabase.isMockMode() ? 'Mock' : 'Real');
  
  if (user) {
    console.log('👤 User:', user);
  }

  // Make game instance available globally for debugging
  if (GAME_CONFIG.DEBUG_MODE) {
    (window as any).game = game;
    (window as any).telegram = telegram;
    (window as any).supabase = supabase;
  }
}

// Start the application
initializeApp().catch(error => {
  console.error('❌ Failed to initialize app:', error);
});
