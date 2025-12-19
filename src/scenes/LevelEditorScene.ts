/**
 * LevelEditorScene - Level editor for development
 */

import Phaser from 'phaser';
import { SCENES, GAME_CONFIG } from '../config/game.config';
import { GridSystem } from '../systems/GridSystem';
import type { GridPosition } from '../types/phaser.types';

type EditorMode = 'spawn' | 'target' | 'path' | 'erase';

export class LevelEditorScene extends Phaser.Scene {
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private gridSystem!: GridSystem;
  private mode: EditorMode = 'spawn';
  private spawnPoints: GridPosition[] = [];
  private targetPoints: GridPosition[] = [];
  private paths: GridPosition[][] = [];
  private currentPath: GridPosition[] = [];
  private isDrawing: boolean = false;
  private modeButtons: Map<EditorMode, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super({ key: SCENES.LEVEL_EDITOR });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Initialize grid system
    this.gridSystem = new GridSystem();

    // Try to load saved level data
    this.loadSavedLevel();

    // Add background
    const bg = this.add.image(0, 0, 'game_background');
    bg.setOrigin(0, 0);
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    bg.setDepth(0);
    bg.setAlpha(0.3);

    // Create grid
    this.gridGraphics = this.add.graphics();
    this.gridGraphics.setDepth(1);
    this.drawGrid();

    // Create UI
    this.createUI();

    // Setup input
    this.setupInput();

    console.log('🎨 Level Editor: Ready');
  }

  private drawGrid(): void {
    this.gridGraphics.clear();

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const gridSize = GAME_CONFIG.GRID_SIZE;

    // Draw grid lines
    this.gridGraphics.lineStyle(1, 0x00ff00, 0.3);
    for (let x = 0; x <= GAME_CONFIG.GRID_COLS; x++) {
      const worldX = x * gridSize;
      this.gridGraphics.lineBetween(worldX, 0, worldX, height);
    }
    for (let y = 0; y <= GAME_CONFIG.GRID_ROWS; y++) {
      const worldY = y * gridSize;
      this.gridGraphics.lineBetween(0, worldY, width, worldY);
    }

    // Draw spawn points (green)
    this.spawnPoints.forEach(pos => {
      const worldPos = this.gridSystem.gridToWorld(pos.x, pos.y);
      this.gridGraphics.fillStyle(0x00ff00, 0.6);
      this.gridGraphics.fillRect(
        worldPos.x - gridSize / 2,
        worldPos.y - gridSize / 2,
        gridSize,
        gridSize
      );
      
      // Draw "S" label
      const label = this.add.text(worldPos.x, worldPos.y, 'S', {
        font: 'bold 24px Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      });
      label.setOrigin(0.5);
      label.setDepth(10);
    });

    // Draw target points (red)
    this.targetPoints.forEach(pos => {
      const worldPos = this.gridSystem.gridToWorld(pos.x, pos.y);
      this.gridGraphics.fillStyle(0xff0000, 0.6);
      this.gridGraphics.fillRect(
        worldPos.x - gridSize / 2,
        worldPos.y - gridSize / 2,
        gridSize,
        gridSize
      );
      
      // Draw "T" label
      const label = this.add.text(worldPos.x, worldPos.y, 'T', {
        font: 'bold 24px Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      });
      label.setOrigin(0.5);
      label.setDepth(10);
    });

    // Draw paths (yellow)
    this.paths.forEach(path => {
      path.forEach((pos, index) => {
        const worldPos = this.gridSystem.gridToWorld(pos.x, pos.y);
        this.gridGraphics.fillStyle(0xffaa00, 0.4);
        this.gridGraphics.fillRect(
          worldPos.x - gridSize / 2,
          worldPos.y - gridSize / 2,
          gridSize,
          gridSize
        );

        // Draw path number
        if (index === 0) {
          const label = this.add.text(worldPos.x, worldPos.y, `${this.paths.indexOf(path) + 1}`, {
            font: 'bold 16px Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
          });
          label.setOrigin(0.5);
          label.setDepth(10);
        }
      });
    });

    // Draw current path being drawn
    if (this.currentPath.length > 0) {
      this.currentPath.forEach(pos => {
        const worldPos = this.gridSystem.gridToWorld(pos.x, pos.y);
        this.gridGraphics.fillStyle(0xffff00, 0.6);
        this.gridGraphics.fillRect(
          worldPos.x - gridSize / 2,
          worldPos.y - gridSize / 2,
          gridSize,
          gridSize
        );
      });
    }
  }

  private createUI(): void {
    const width = this.cameras.main.width;

    // Title
    const title = this.add.text(width / 2, 20, '🎨 Level Editor', {
      font: 'bold 24px Arial',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 4,
    });
    title.setOrigin(0.5);
    title.setDepth(100);

    // Mode buttons
    const modes: EditorMode[] = ['spawn', 'target', 'path', 'erase'];
    const modeLabels = {
      spawn: '🟢 Spawn',
      target: '🔴 Target',
      path: '🟡 Path',
      erase: '❌ Erase',
    };

    modes.forEach((mode, index) => {
      const x = 20 + index * 110;
      const y = 60;
      const button = this.createModeButton(x, y, modeLabels[mode], mode);
      this.modeButtons.set(mode, button);
    });

    // Action buttons
    this.createActionButton(width - 450, 60, '🗑️ Clear', () => this.clearLevel());
    this.createActionButton(width - 340, 60, '💾 Export', () => this.exportLevel());
    this.createActionButton(width - 230, 60, '🎮 Test', () => this.testLevel());
    this.createActionButton(width - 120, 60, '🔙 Back', () => this.backToMenu());

    // Instructions
    const instructions = this.add.text(width / 2, this.cameras.main.height - 30, 
      'Click cells to place. Path mode: hold and drag. Erase: click to remove.', {
      font: '14px Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
    });
    instructions.setOrigin(0.5);
    instructions.setDepth(100);

    // Update selected mode
    this.updateModeSelection();
  }

  private createModeButton(x: number, y: number, label: string, mode: EditorMode): Phaser.GameObjects.Container {
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a2a, 1);
    bg.fillRoundedRect(0, 0, 100, 40, 8);
    bg.lineStyle(2, 0x00ff00, 0.5);
    bg.strokeRoundedRect(0, 0, 100, 40, 8);

    const hitArea = this.add.rectangle(50, 20, 100, 40, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });

    const text = this.add.text(50, 20, label, {
      font: 'bold 12px Arial',
      color: '#ffffff',
    });
    text.setOrigin(0.5);

    const button = this.add.container(x, y, [bg, hitArea, text]);
    button.setDepth(100);

    hitArea.on('pointerdown', () => {
      this.mode = mode;
      this.updateModeSelection();
      
      // If switching away from path mode, save current path
      if (mode !== 'path' && this.currentPath.length > 0) {
        this.paths.push([...this.currentPath]);
        this.currentPath = [];
      }
      this.isDrawing = false;
      this.drawGrid();
    });

    return button;
  }

  private updateModeSelection(): void {
    this.modeButtons.forEach((button, mode) => {
      const bg = button.list[0] as Phaser.GameObjects.Graphics;
      bg.clear();
      
      if (mode === this.mode) {
        // Selected
        bg.fillStyle(0x00aa00, 1);
        bg.fillRoundedRect(0, 0, 100, 40, 8);
        bg.lineStyle(3, 0x00ff00, 1);
        bg.strokeRoundedRect(0, 0, 100, 40, 8);
      } else {
        // Normal
        bg.fillStyle(0x2a2a2a, 1);
        bg.fillRoundedRect(0, 0, 100, 40, 8);
        bg.lineStyle(2, 0x00ff00, 0.5);
        bg.strokeRoundedRect(0, 0, 100, 40, 8);
      }
    });
  }

  private createActionButton(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x00aa00, 1);
    bg.fillRoundedRect(0, 0, 100, 40, 8);
    bg.lineStyle(2, 0xffffff, 0.3);
    bg.strokeRoundedRect(0, 0, 100, 40, 8);

    const hitArea = this.add.rectangle(50, 20, 100, 40, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });

    const text = this.add.text(50, 20, label, {
      font: 'bold 12px Arial',
      color: '#ffffff',
    });
    text.setOrigin(0.5);

    const button = this.add.container(x, y, [bg, hitArea, text]);
    button.setDepth(100);

    hitArea.on('pointerover', () => button.setScale(1.05));
    hitArea.on('pointerout', () => button.setScale(1));
    hitArea.on('pointerdown', onClick);
  }

  private setupInput(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < 120) return; // Ignore UI area
      
      const gridPos = this.gridSystem.worldToGrid(pointer.x, pointer.y);
      
      if (gridPos.x < 0 || gridPos.x >= GAME_CONFIG.GRID_COLS ||
          gridPos.y < 0 || gridPos.y >= GAME_CONFIG.GRID_ROWS) {
        return;
      }

      switch (this.mode) {
        case 'spawn':
          this.addSpawnPoint(gridPos);
          break;
        case 'target':
          this.addTargetPoint(gridPos);
          break;
        case 'path':
          this.isDrawing = true;
          this.addToCurrentPath(gridPos);
          break;
        case 'erase':
          this.eraseAt(gridPos);
          break;
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDrawing && this.mode === 'path') {
        const gridPos = this.gridSystem.worldToGrid(pointer.x, pointer.y);
        
        if (gridPos.x >= 0 && gridPos.x < GAME_CONFIG.GRID_COLS &&
            gridPos.y >= 0 && gridPos.y < GAME_CONFIG.GRID_ROWS) {
          this.addToCurrentPath(gridPos);
        }
      }
    });

    this.input.on('pointerup', () => {
      if (this.mode === 'path' && this.isDrawing) {
        this.isDrawing = false;
        if (this.currentPath.length > 0) {
          this.paths.push([...this.currentPath]);
          this.currentPath = [];
          this.drawGrid();
        }
      }
    });
  }

  private addSpawnPoint(pos: GridPosition): void {
    // Check if already exists
    const exists = this.spawnPoints.some(p => p.x === pos.x && p.y === pos.y);
    if (!exists) {
      this.spawnPoints.push(pos);
      this.drawGrid();
    }
  }

  private addTargetPoint(pos: GridPosition): void {
    // Check if already exists
    const exists = this.targetPoints.some(p => p.x === pos.x && p.y === pos.y);
    if (!exists) {
      this.targetPoints.push(pos);
      this.drawGrid();
    }
  }

  private addToCurrentPath(pos: GridPosition): void {
    // Check if already in current path
    const exists = this.currentPath.some(p => p.x === pos.x && p.y === pos.y);
    if (!exists) {
      // Check adjacency to last point
      if (this.currentPath.length > 0) {
        const last = this.currentPath[this.currentPath.length - 1];
        const distance = Math.abs(pos.x - last.x) + Math.abs(pos.y - last.y);
        if (distance !== 1) return; // Must be adjacent
      }
      
      this.currentPath.push(pos);
      this.drawGrid();
    }
  }

  private eraseAt(pos: GridPosition): void {
    // Remove spawn point
    this.spawnPoints = this.spawnPoints.filter(p => !(p.x === pos.x && p.y === pos.y));
    
    // Remove target point
    this.targetPoints = this.targetPoints.filter(p => !(p.x === pos.x && p.y === pos.y));
    
    // Remove from paths
    this.paths = this.paths.filter(path => {
      return !path.some(p => p.x === pos.x && p.y === pos.y);
    });
    
    this.drawGrid();
  }

  private exportLevel(): void {
    const levelData = {
      spawnPoints: this.spawnPoints,
      targetPoints: this.targetPoints,
      paths: this.paths,
      gridWidth: GAME_CONFIG.GRID_COLS,
      gridHeight: GAME_CONFIG.GRID_ROWS,
    };

    const json = JSON.stringify(levelData, null, 2);
    console.log('📋 Level Data:');
    console.log(json);

    // Copy to clipboard if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json).then(() => {
        this.showNotification('✅ Level exported to console and clipboard!');
      });
    } else {
      this.showNotification('✅ Level exported to console!');
    }

    // Save to localStorage
    localStorage.setItem('levelEditorData', json);
  }

  private testLevel(): void {
    if (this.spawnPoints.length === 0) {
      this.showNotification('❌ Add at least one spawn point!');
      return;
    }
    if (this.targetPoints.length === 0) {
      this.showNotification('❌ Add at least one target point!');
      return;
    }
    if (this.paths.length === 0) {
      this.showNotification('❌ Draw at least one path!');
      return;
    }

    // Save level data
    const levelData = {
      spawnPoints: this.spawnPoints,
      targetPoints: this.targetPoints,
      paths: this.paths,
    };
    localStorage.setItem('testLevelData', JSON.stringify(levelData));

    this.showNotification('🎮 Starting test...');
    
    // Start game scene
    setTimeout(() => {
      this.scene.start(SCENES.GAME);
      this.scene.launch(SCENES.UI);
    }, 500);
  }

  private backToMenu(): void {
    this.scene.start(SCENES.MAIN_MENU);
  }

  private clearLevel(): void {
    this.spawnPoints = [];
    this.targetPoints = [];
    this.paths = [];
    this.currentPath = [];
    this.drawGrid();
    this.showNotification('🗑️ Level cleared!');
  }

  private showNotification(message: string): void {
    const width = this.cameras.main.width;
    const notification = this.add.text(width / 2, 150, message, {
      font: 'bold 18px Arial',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
    });
    notification.setOrigin(0.5);
    notification.setDepth(200);

    this.tweens.add({
      targets: notification,
      alpha: 0,
      y: 100,
      duration: 2000,
      ease: 'Quad.easeOut',
      onComplete: () => notification.destroy(),
    });
  }

  private loadSavedLevel(): void {
    const saved = localStorage.getItem('levelEditorData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.spawnPoints = data.spawnPoints || [];
        this.targetPoints = data.targetPoints || [];
        this.paths = data.paths || [];
        console.log('✅ Loaded saved level data');
        this.showNotification('✅ Loaded previous level');
      } catch (e) {
        console.error('❌ Failed to load saved level:', e);
      }
    }
  }
}

