/**
 * Game configuration constants
 */

export const GAME_CONFIG = {
  // Display
  WIDTH: 1280,
  HEIGHT: 720,
  
  // Grid System
  GRID_SIZE: 64, // Size of each grid cell in pixels
  GRID_COLS: 20, // 1280 / 64
  GRID_ROWS: 11, // 720 / 64 (with UI space)
  
  // Game Balance
  STARTING_MONEY: 500,
  STARTING_ERROR_BUDGET: 100,
  
  // Tower Costs
  TOWER_COSTS: {
    nginx: 100,
    load_balancer: 150,
    redis: 120,
    kafka: 200,
    database: 180,
    monitoring: 80,
  },
  
  // Wave System
  WAVE_START_DELAY: 5000, // ms before first wave
  WAVE_INTERVAL: 3000, // ms between waves
  
  // Debug
  DEBUG_MODE: false,
  SHOW_GRID: true,
  SHOW_HITBOXES: false,
} as const;

export const COLORS = {
  // UI Colors
  PRIMARY: 0x00ff00,
  SECONDARY: 0x00aa00,
  DANGER: 0xff0000,
  WARNING: 0xff9800,
  SUCCESS: 0x4caf50,
  
  // Grid Colors
  GRID_LINE: 0x333333,
  GRID_VALID: 0x00ff0044,
  GRID_INVALID: 0xff000044,
  
  // Entity Colors (for placeholder graphics)
  TOWER: 0x00ff00,
  ENEMY: 0xff0000,
  PROJECTILE: 0xffff00,
  PATH: 0x666666,
} as const;

export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MAIN_MENU: 'MainMenuScene',
  GAME: 'GameScene',
  UI: 'UIScene',
  PAUSE: 'PauseScene',
  GAME_OVER: 'GameOverScene',
  VICTORY: 'VictoryScene',
} as const;

