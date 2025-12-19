/**
 * GameScene - Main gameplay scene
 */

import Phaser from 'phaser';
import { SCENES, GAME_CONFIG, COLORS } from '../config/game.config';
import { gameManager } from '../game/GameManager';
import type { LevelData, GridPosition } from '../types/phaser.types';

export class GameScene extends Phaser.Scene {
  private gridGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: SCENES.GAME });
  }

  create(): void {
    console.log('🎮 GameScene: Initializing...');

    // Create mock level data
    const mockLevel = this.createMockLevel();
    
    // Initialize game manager with level
    gameManager.initializeGame(mockLevel);

    // Create grid
    this.createGrid();

    // Add placeholder text
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const text = this.add.text(centerX, centerY, 
      'Game Scene\n\nClick to place towers (Coming soon!)\nPress ESC to pause', {
      font: '24px Arial',
      color: '#00ff00',
      align: 'center',
    });
    text.setOrigin(0.5);
    text.setDepth(100);

    // Setup input
    this.setupInput();

    // Listen to game manager events
    this.setupGameEvents();

    console.log('✅ GameScene: Ready');
  }

  private createGrid(): void {
    this.gridGraphics = this.add.graphics();
    
    if (GAME_CONFIG.SHOW_GRID) {
      this.drawGrid();
    }
  }

  private drawGrid(): void {
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, COLORS.GRID_LINE, 0.3);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const gridSize = GAME_CONFIG.GRID_SIZE;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      this.gridGraphics.lineBetween(x, 0, x, height);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      this.gridGraphics.lineBetween(0, y, width, y);
    }
  }

  private setupInput(): void {
    // ESC to pause
    this.input.keyboard?.on('keydown-ESC', () => {
      this.pauseGame();
    });

    // Grid click handler
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const gridPos = this.worldToGrid(pointer.x, pointer.y);
      console.log('Clicked grid position:', gridPos);
      // TODO: Handle tower placement
    });
  }

  private setupGameEvents(): void {
    gameManager.on('money:changed', (money: number) => {
      console.log('💰 Money:', money);
    });

    gameManager.on('errorBudget:changed', (errorBudget: number) => {
      console.log('❤️ Error Budget:', errorBudget);
    });

    gameManager.on('wave:started', (wave: number) => {
      console.log('🌊 Wave started:', wave);
    });

    gameManager.on('game:over', (score: number) => {
      console.log('💀 Game Over! Score:', score);
      this.scene.start(SCENES.GAME_OVER);
    });

    gameManager.on('game:victory', (score: number) => {
      console.log('🎉 Victory! Score:', score);
      this.scene.start(SCENES.VICTORY);
    });
  }

  private pauseGame(): void {
    gameManager.pause();
    this.scene.pause();
    this.scene.launch(SCENES.PAUSE);
  }

  private worldToGrid(worldX: number, worldY: number): GridPosition {
    return {
      x: Math.floor(worldX / GAME_CONFIG.GRID_SIZE),
      y: Math.floor(worldY / GAME_CONFIG.GRID_SIZE),
    };
  }

  private gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2,
      y: gridY * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2,
    };
  }

  private createMockLevel(): LevelData {
    return {
      id: 1,
      name: 'Tutorial Level',
      description: 'Learn the basics',
      gridWidth: GAME_CONFIG.GRID_COLS,
      gridHeight: GAME_CONFIG.GRID_ROWS,
      spawnPoints: [{ x: 0, y: 5 }],
      targetPoints: [{ x: 19, y: 5 }],
      paths: [
        // Simple straight path
        Array.from({ length: 20 }, (_, i) => ({ x: i, y: 5 })),
      ],
      buildableArea: [], // Will be filled based on paths
      waves: [
        {
          waveNumber: 1,
          enemies: [
            { type: 'traffic_spike', count: 5, interval: 1000 },
          ],
          reward: 100,
        },
      ],
      startingMoney: GAME_CONFIG.STARTING_MONEY,
      startingErrorBudget: GAME_CONFIG.STARTING_ERROR_BUDGET,
    };
  }
}

