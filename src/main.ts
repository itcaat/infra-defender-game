import Phaser from 'phaser';
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

// Initialize app
async function initializeApp() {
  console.log('🚀 Initializing Infra Defender...');
  
  // Default theme
  const theme = {
    bgColor: '#1a1a1a',
    textColor: '#ffffff',
    hintColor: '#aaaaaa',
    linkColor: '#4CAF50',
    buttonColor: '#4CAF50',
    buttonTextColor: '#ffffff',
    secondaryBgColor: '#2a2a2a',
  };
  
  console.log('🎨 Using theme:', theme);
  
  // Update body background
  document.body.style.backgroundColor = theme.bgColor;
  
  // Game configuration
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    parent: 'game-container',
    backgroundColor: theme.bgColor,
    dom: {
      createContainer: true,
    },
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

  // Make game instance available globally for debugging
  if (GAME_CONFIG.DEBUG_MODE) {
    (window as any).game = game;
  }
}

// Start the application
initializeApp().catch(error => {
  console.error('❌ Failed to initialize app:', error);
});
