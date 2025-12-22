/**
 * LevelEditorScene - Level editor for development
 */

import Phaser from 'phaser';
import { SCENES, GAME_CONFIG } from '../config/game.config';
import type { GridPosition, DecorObject, DecorType } from '../types/phaser.types';

type EditorMode = 'spawn' | 'target' | 'path' | 'decor' | 'erase';

export class LevelEditorScene extends Phaser.Scene {
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private previewGraphics!: Phaser.GameObjects.Graphics;
  private previewSprite?: Phaser.GameObjects.Image | Phaser.GameObjects.DOMElement;
  private mode: EditorMode | null = null; // No mode selected by default
  private selectedDecorType: DecorType = 'tux';
  private spawnPoints: GridPosition[] = [];
  private targetPoints: GridPosition[] = [];
  private paths: GridPosition[][] = [];
  private decorations: DecorObject[] = [];
  private decorSprites: (Phaser.GameObjects.Image | Phaser.GameObjects.DOMElement)[] = [];
  private currentPath: GridPosition[] = [];
  private isDrawing: boolean = false;
  private modeButtons: Map<EditorMode, Phaser.GameObjects.Container> = new Map();
  private decorButtons: Map<DecorType, Phaser.GameObjects.Container> = new Map();
  private labels: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: SCENES.LEVEL_EDITOR });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

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

    // Create preview graphics
    this.previewGraphics = this.add.graphics();
    this.previewGraphics.setDepth(5);

    // Create UI
    this.createUI();

    // Setup input
    this.setupInput();

    console.log('🎨 Level Editor: Ready');
  }

  private drawGrid(): void {
    this.gridGraphics.clear();
    
    // Clear all labels
    this.labels.forEach(label => label.destroy());
    this.labels = [];

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const pathGridSize = GAME_CONFIG.PATH_GRID_SIZE;

    // Draw fine grid only (subtle orange)
    this.gridGraphics.lineStyle(1, 0xffaa00, 0.2);
    for (let x = 0; x <= GAME_CONFIG.PATH_GRID_COLS; x++) {
      const worldX = x * pathGridSize;
      this.gridGraphics.lineBetween(worldX, 0, worldX, height);
    }
    for (let y = 0; y <= GAME_CONFIG.PATH_GRID_ROWS; y++) {
      const worldY = y * pathGridSize;
      this.gridGraphics.lineBetween(0, worldY, width, worldY);
    }

    // Draw spawn points (green) - using fine grid
    this.spawnPoints.forEach(pos => {
      const worldX = pos.x * pathGridSize + pathGridSize / 2;
      const worldY = pos.y * pathGridSize + pathGridSize / 2;
      
      // Draw a larger marker (4x4 fine grid cells)
      const markerSize = pathGridSize * 4;
      this.gridGraphics.fillStyle(0x00ff00, 0.7);
      this.gridGraphics.fillRect(
        worldX - markerSize / 2,
        worldY - markerSize / 2,
        markerSize,
        markerSize
      );
      
      // Draw "S" label
      const label = this.add.text(worldX, worldY, 'S', {
        font: 'bold 20px Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      });
      label.setOrigin(0.5);
      label.setDepth(10);
      this.labels.push(label);
    });

    // Draw target points (red) - using fine grid
    this.targetPoints.forEach(pos => {
      const worldX = pos.x * pathGridSize + pathGridSize / 2;
      const worldY = pos.y * pathGridSize + pathGridSize / 2;
      
      // Draw a larger marker (4x4 fine grid cells)
      const markerSize = pathGridSize * 4;
      this.gridGraphics.fillStyle(0xff0000, 0.7);
      this.gridGraphics.fillRect(
        worldX - markerSize / 2,
        worldY - markerSize / 2,
        markerSize,
        markerSize
      );
      
      // Draw "T" label
      const label = this.add.text(worldX, worldY, 'T', {
        font: 'bold 20px Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      });
      label.setOrigin(0.5);
      label.setDepth(10);
      this.labels.push(label);
    });

    // Draw paths (yellow) - using fine grid
    this.paths.forEach(path => {
      path.forEach((pos, index) => {
        const worldX = pos.x * pathGridSize + pathGridSize / 2;
        const worldY = pos.y * pathGridSize + pathGridSize / 2;
        
        this.gridGraphics.fillStyle(0xffaa00, 0.6);
        this.gridGraphics.fillRect(
          worldX - pathGridSize / 2,
          worldY - pathGridSize / 2,
          pathGridSize,
          pathGridSize
        );

        // Draw path number at start
        if (index === 0) {
          const label = this.add.text(worldX, worldY, `${this.paths.indexOf(path) + 1}`, {
            font: 'bold 12px Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
          });
          label.setOrigin(0.5);
          label.setDepth(10);
          this.labels.push(label);
        }
      });
    });

    // Draw current path being drawn
    if (this.currentPath.length > 0) {
      this.currentPath.forEach(pos => {
        const worldX = pos.x * pathGridSize + pathGridSize / 2;
        const worldY = pos.y * pathGridSize + pathGridSize / 2;
        
        this.gridGraphics.fillStyle(0xffff00, 0.8);
        this.gridGraphics.fillRect(
          worldX - pathGridSize / 2,
          worldY - pathGridSize / 2,
          pathGridSize,
          pathGridSize
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
    const modes: EditorMode[] = ['spawn', 'target', 'path', 'decor', 'erase'];
    const modeLabels = {
      spawn: '🟢 Spawn',
      target: '🔴 Target',
      path: '🟡 Path',
      decor: '🎨 Decor',
      erase: '❌ Erase',
    };

    modes.forEach((mode, index) => {
      const x = 20 + index * 110;
      const y = 60;
      const button = this.createModeButton(x, y, modeLabels[mode], mode);
      this.modeButtons.set(mode, button);
    });

    // Decor type buttons (shown only in decor mode)
    this.createDecorButtons();

    // Action buttons
    this.createActionButton(width - 560, 60, '📂 Load', () => this.showLoadMenu());
    this.createActionButton(width - 450, 60, '🗑️ Clear', () => this.clearLevel());
    this.createActionButton(width - 340, 60, '💾 Save', () => this.exportLevel());
    this.createActionButton(width - 230, 60, '🎮 Test', () => this.testLevel());
    this.createActionButton(width - 120, 60, '🔙 Back', () => this.backToMenu());

    // Instructions
    const instructions = this.add.text(width / 2, this.cameras.main.height - 30, 
      'All elements use fine grid (8x8px). Hold and drag in Path mode to draw smooth paths.', {
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
      
      // Clear preview when switching modes
      this.previewGraphics.clear();
      
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
      
      if (this.mode && mode === this.mode) {
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

    // Show/hide decor buttons
    this.updateDecorButtonsVisibility();
  }

  private createDecorButtons(): void {
    const decorTypes: DecorType[] = ['tux', 'tenor', 'peppo'];
    const decorLabels: Record<DecorType, string> = {
      tux: '🐧 Tux',
      tenor: '💻 Tenor',
      peppo: '🐸 Peppo',
    };

    decorTypes.forEach((decorType, index) => {
      const x = 20 + index * 110;
      const y = 110; // Below mode buttons
      const button = this.createDecorTypeButton(x, y, decorLabels[decorType], decorType);
      this.decorButtons.set(decorType, button);
    });

    // Initially hidden
    this.updateDecorButtonsVisibility();
  }

  private createDecorTypeButton(x: number, y: number, label: string, decorType: DecorType): Phaser.GameObjects.Container {
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a2a, 1);
    bg.fillRoundedRect(0, 0, 100, 40, 8);
    bg.lineStyle(2, 0xaa00aa, 0.5);
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
      this.selectedDecorType = decorType;
      this.updateDecorTypeSelection();
    });

    return button;
  }

  private updateDecorButtonsVisibility(): void {
    const visible = this.mode === 'decor';
    this.decorButtons.forEach((button) => {
      button.setVisible(visible);
    });
    if (visible) {
      this.updateDecorTypeSelection();
    }
  }

  private updateDecorTypeSelection(): void {
    this.decorButtons.forEach((button, decorType) => {
      const bg = button.list[0] as Phaser.GameObjects.Graphics;
      bg.clear();
      
      if (decorType === this.selectedDecorType) {
        // Selected
        bg.fillStyle(0xaa00aa, 1);
        bg.fillRoundedRect(0, 0, 100, 40, 8);
        bg.lineStyle(3, 0xff00ff, 1);
        bg.strokeRoundedRect(0, 0, 100, 40, 8);
      } else {
        // Normal
        bg.fillStyle(0x2a2a2a, 1);
        bg.fillRoundedRect(0, 0, 100, 40, 8);
        bg.lineStyle(2, 0xaa00aa, 0.5);
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
      if (!this.mode) return; // No mode selected
      
      // Always use fine grid for all modes
      const gridPos = this.worldToPathGrid(pointer.x, pointer.y);
      if (gridPos.x < 0 || gridPos.x >= GAME_CONFIG.PATH_GRID_COLS ||
          gridPos.y < 0 || gridPos.y >= GAME_CONFIG.PATH_GRID_ROWS) {
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
        case 'decor':
          this.addDecoration(gridPos);
          break;
        case 'erase':
          this.eraseAt(gridPos);
          break;
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // Update preview for spawn/target/decor modes
      if (pointer.y >= 120 && (this.mode === 'spawn' || this.mode === 'target' || this.mode === 'decor')) {
        this.updatePreview(pointer.x, pointer.y);
      } else if (pointer.y < 120 || pointer.y < 160 && this.mode === 'decor') {
        // Clear preview when over UI (decor buttons are at y=110)
        this.previewGraphics.clear();
      }
      
      // Handle path drawing
      if (this.isDrawing && this.mode === 'path') {
        const gridPos = this.worldToPathGrid(pointer.x, pointer.y);
        
        if (gridPos.x >= 0 && gridPos.x < GAME_CONFIG.PATH_GRID_COLS &&
            gridPos.y >= 0 && gridPos.y < GAME_CONFIG.PATH_GRID_ROWS) {
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
          this.autoSave();
        }
      }
    });

    // Clear preview when mouse leaves the game area
    this.input.on('pointerout', () => {
      this.previewGraphics.clear();
    });
  }

  private addSpawnPoint(pos: GridPosition): void {
    // Check if already exists
    const exists = this.spawnPoints.some(p => p.x === pos.x && p.y === pos.y);
    if (!exists) {
      this.spawnPoints.push(pos);
      this.drawGrid();
      this.autoSave();
    }
  }

  private addTargetPoint(pos: GridPosition): void {
    // Check if already exists
    const exists = this.targetPoints.some(p => p.x === pos.x && p.y === pos.y);
    if (!exists) {
      this.targetPoints.push(pos);
      this.drawGrid();
      this.autoSave();
    }
  }

  private addDecoration(pos: GridPosition): void {
    // Add decoration at position
    this.decorations.push({
      type: this.selectedDecorType,
      position: pos,
    });
    this.drawDecorations();
    this.autoSave();
  }

  private drawDecorations(): void {
    // Clear previous sprites
    this.decorSprites.forEach(sprite => sprite.destroy());
    this.decorSprites = [];

    // Draw all decorations using DOM elements for GIF animation
    const pathGridSize = GAME_CONFIG.PATH_GRID_SIZE;
    const decorSize = pathGridSize * 8; // 8x8 grid cells
    this.decorations.forEach(decor => {
      const worldX = decor.position.x * pathGridSize + pathGridSize / 2;
      const worldY = decor.position.y * pathGridSize + pathGridSize / 2;
      
      // Use DOM element for animated GIF
      const dom = this.add.dom(worldX, worldY, 'img', {
        width: `${decorSize}px`,
        height: `${decorSize}px`,
        'pointer-events': 'none',
        transform: 'translate(-50%, -50%)', // Center the image
      });
      
      const img = dom.node as HTMLImageElement;
      const basePath = import.meta.env.BASE_URL || '/';
      img.src = `${basePath}animations/${decor.type === 'tux' ? 'tux-linux-tux.gif' : decor.type === 'tenor' ? 'tenor.gif' : 'peppo-dance.gif'}`;
      
      dom.setDepth(2); // Above grid, below UI
      this.decorSprites.push(dom as any);
    });
  }

  private worldToPathGrid(worldX: number, worldY: number): GridPosition {
    const pathGridSize = GAME_CONFIG.PATH_GRID_SIZE;
    return {
      x: Math.floor(worldX / pathGridSize),
      y: Math.floor(worldY / pathGridSize)
    };
  }

  private updatePreview(worldX: number, worldY: number): void {
    this.previewGraphics.clear();
    
    // Clear preview sprite if exists
    if (this.previewSprite) {
      this.previewSprite.destroy();
      this.previewSprite = undefined;
    }

    if (!this.mode) return; // No mode selected

    const gridPos = this.worldToPathGrid(worldX, worldY);
    
    // Check bounds
    if (gridPos.x < 0 || gridPos.x >= GAME_CONFIG.PATH_GRID_COLS ||
        gridPos.y < 0 || gridPos.y >= GAME_CONFIG.PATH_GRID_ROWS) {
      return;
    }

    const pathGridSize = GAME_CONFIG.PATH_GRID_SIZE;
    const posWorldX = gridPos.x * pathGridSize + pathGridSize / 2;
    const posWorldY = gridPos.y * pathGridSize + pathGridSize / 2;
    const markerSize = pathGridSize * 4;

    // Draw preview based on mode
    if (this.mode === 'spawn') {
      // Check if already exists
      const exists = this.spawnPoints.some(p => p.x === gridPos.x && p.y === gridPos.y);
      const alpha = exists ? 0.3 : 0.5;
      
      this.previewGraphics.fillStyle(0x00ff00, alpha);
      this.previewGraphics.fillRect(
        posWorldX - markerSize / 2,
        posWorldY - markerSize / 2,
        markerSize,
        markerSize
      );
      
      // Border
      this.previewGraphics.lineStyle(2, 0x00ff00, 0.8);
      this.previewGraphics.strokeRect(
        posWorldX - markerSize / 2,
        posWorldY - markerSize / 2,
        markerSize,
        markerSize
      );
    } else if (this.mode === 'target') {
      // Check if already exists
      const exists = this.targetPoints.some(p => p.x === gridPos.x && p.y === gridPos.y);
      const alpha = exists ? 0.3 : 0.5;
      
      this.previewGraphics.fillStyle(0xff0000, alpha);
      this.previewGraphics.fillRect(
        posWorldX - markerSize / 2,
        posWorldY - markerSize / 2,
        markerSize,
        markerSize
      );
      
      // Border
      this.previewGraphics.lineStyle(2, 0xff0000, 0.8);
      this.previewGraphics.strokeRect(
        posWorldX - markerSize / 2,
        posWorldY - markerSize / 2,
        markerSize,
        markerSize
      );
    } else if (this.mode === 'decor') {
      // Show decor preview using DOM for animation
      if (this.previewSprite) {
        (this.previewSprite as Phaser.GameObjects.Image | Phaser.GameObjects.DOMElement).destroy();
        this.previewSprite = undefined;
      }
      
      const decorSize = pathGridSize * 8; // 8x8 grid cells
      const dom = this.add.dom(posWorldX, posWorldY, 'img', {
        width: `${decorSize}px`,
        height: `${decorSize}px`,
        opacity: '0.6',
        'pointer-events': 'none',
        transform: 'translate(-50%, -50%)', // Center the image on cursor
      });
      
      const img = dom.node as HTMLImageElement;
      const basePath = import.meta.env.BASE_URL || '/';
      img.src = `${basePath}animations/${this.selectedDecorType === 'tux' ? 'tux-linux-tux.gif' : this.selectedDecorType === 'tenor' ? 'tenor.gif' : 'peppo-dance.gif'}`;
      
      dom.setDepth(6);
      this.previewSprite = dom as any;
    }
  }

  private addToCurrentPath(pos: GridPosition): void {
    // Check if already in current path
    const exists = this.currentPath.some(p => p.x === pos.x && p.y === pos.y);
    if (!exists) {
      // Check adjacency to last point (for fine grid, allow diagonal too)
      if (this.currentPath.length > 0) {
        const last = this.currentPath[this.currentPath.length - 1];
        const dx = Math.abs(pos.x - last.x);
        const dy = Math.abs(pos.y - last.y);
        const distance = Math.max(dx, dy); // Chebyshev distance
        if (distance > 1) return; // Must be adjacent or diagonal
      }
      
      this.currentPath.push(pos);
      this.drawGrid();
    }
  }

  private eraseAt(pos: GridPosition): void {
    const decorCountBefore = this.decorations.length;
    
    // Remove spawn point
    this.spawnPoints = this.spawnPoints.filter(p => !(p.x === pos.x && p.y === pos.y));
    
    // Remove target point
    this.targetPoints = this.targetPoints.filter(p => !(p.x === pos.x && p.y === pos.y));
    
    // Remove from paths
    this.paths = this.paths.filter(path => {
      return !path.some(p => p.x === pos.x && p.y === pos.y);
    });
    
    // Remove decorations if click is inside their area
    // Decoration is 8x8 cells, check if click is within bounds
    this.decorations = this.decorations.filter(decor => {
      const dx = Math.abs(decor.position.x - pos.x);
      const dy = Math.abs(decor.position.y - pos.y);
      // Keep if click is outside the decoration area (8 cells = full size)
      // Using 8 instead of 4 to make deletion easier
      const shouldKeep = dx > 8 || dy > 8;
      if (!shouldKeep) {
        console.log(`🗑️ Removing decoration at (${decor.position.x}, ${decor.position.y}), clicked at (${pos.x}, ${pos.y}), dx=${dx}, dy=${dy}`);
      }
      return shouldKeep;
    });
    
    if (decorCountBefore !== this.decorations.length) {
      console.log(`✅ Removed ${decorCountBefore - this.decorations.length} decoration(s)`);
    }
    
    this.drawGrid();
    this.drawDecorations();
    this.autoSave();
  }

  private exportLevel(): void {
    const levelData = {
      spawnPoints: this.spawnPoints,
      targetPoints: this.targetPoints,
      paths: this.paths,
      decorations: this.decorations,
      gridWidth: GAME_CONFIG.PATH_GRID_COLS,
      gridHeight: GAME_CONFIG.PATH_GRID_ROWS,
    };

    const json = JSON.stringify(levelData, null, 2);
    console.log('📋 Level Data:');
    console.log(json);

    // Save to persistent storage
    const savedLevels = this.getSavedLevels();
    const nextLevelId = Object.keys(savedLevels).length + 1;
    savedLevels[nextLevelId] = levelData;
    localStorage.setItem('savedCustomLevels', JSON.stringify(savedLevels));

    // Also save current level for editor persistence
    localStorage.setItem('levelEditorData', json);

    // Download as file
    this.downloadLevelFile(levelData, nextLevelId);

    // Copy to clipboard if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json).then(() => {
        this.showNotification(`✅ Level ${nextLevelId} saved and downloaded!`);
      });
    } else {
      this.showNotification(`✅ Level ${nextLevelId} saved and downloaded!`);
    }
  }

  private downloadLevelFile(levelData: any, levelId: number): void {
    const json = JSON.stringify(levelData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `level-${levelId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private getSavedLevels(): Record<number, any> {
    const saved = localStorage.getItem('savedCustomLevels');
    return saved ? JSON.parse(saved) : {};
  }

  private testLevel(): void {
    if (this.paths.length === 0) {
      this.showNotification('❌ Draw at least one path!');
      return;
    }

    // Validate that paths are valid
    for (let i = 0; i < this.paths.length; i++) {
      const path = this.paths[i];
      if (path.length < 2) {
        this.showNotification(`❌ Path ${i + 1} is too short!`);
        return;
      }
    }

    // Save level data
    const levelData = {
      spawnPoints: this.spawnPoints,
      targetPoints: this.targetPoints,
      paths: this.paths,
      decorations: this.decorations,
      gridWidth: GAME_CONFIG.PATH_GRID_COLS,
      gridHeight: GAME_CONFIG.PATH_GRID_ROWS,
    };
    
    // Save to both testLevelData (for game) and levelEditorData (for restoration)
    const levelDataJson = JSON.stringify(levelData);
    localStorage.setItem('testLevelData', levelDataJson);
    localStorage.setItem('levelEditorData', levelDataJson);

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
    this.decorations = [];
    this.drawGrid();
    this.drawDecorations();
    this.autoSave();
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
        this.decorations = data.decorations || [];
        console.log('✅ Loaded saved level data');
        this.showNotification('✅ Loaded previous session');
        this.drawDecorations(); // Draw loaded decorations
      } catch (e) {
        console.error('❌ Failed to load saved level:', e);
      }
    }
  }

  private autoSave(): void {
    const levelData = {
      spawnPoints: this.spawnPoints,
      targetPoints: this.targetPoints,
      paths: this.paths,
      decorations: this.decorations,
      gridWidth: GAME_CONFIG.PATH_GRID_COLS,
      gridHeight: GAME_CONFIG.PATH_GRID_ROWS,
    };
    localStorage.setItem('levelEditorData', JSON.stringify(levelData));
  }

  private showLoadMenu(): void {
    const savedLevels = this.getSavedLevels();
    const levelIds = Object.keys(savedLevels).map(Number);

    if (levelIds.length === 0) {
      this.showNotification('❌ No saved levels found!');
      return;
    }

    // Create load menu
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    overlay.setOrigin(0, 0);
    overlay.setDepth(500);
    overlay.setInteractive();

    const panelWidth = 400;
    const panelHeight = Math.min(400, 100 + levelIds.length * 60);

    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a1a, 1);
    panel.fillRoundedRect(width / 2 - panelWidth / 2, height / 2 - panelHeight / 2, panelWidth, panelHeight, 12);
    panel.lineStyle(3, 0x00ff00, 1);
    panel.strokeRoundedRect(width / 2 - panelWidth / 2, height / 2 - panelHeight / 2, panelWidth, panelHeight, 12);
    panel.setDepth(501);

    const title = this.add.text(width / 2, height / 2 - panelHeight / 2 + 30, '📂 Load Saved Level', {
      font: 'bold 24px Arial',
      color: '#00ff00',
    });
    title.setOrigin(0.5);
    title.setDepth(502);

    const container: Phaser.GameObjects.GameObject[] = [overlay, panel, title];

    levelIds.forEach((levelId, index) => {
      const y = height / 2 - panelHeight / 2 + 80 + index * 60;
      
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x2a2a2a, 1);
      btnBg.fillRoundedRect(width / 2 - 150, y - 20, 300, 40, 8);
      btnBg.setDepth(502);
      btnBg.setInteractive(
        new Phaser.Geom.Rectangle(width / 2 - 150, y - 20, 300, 40),
        Phaser.Geom.Rectangle.Contains
      );

      const btnText = this.add.text(width / 2, y, `Level ${levelId}`, {
        font: 'bold 18px Arial',
        color: '#ffffff',
      });
      btnText.setOrigin(0.5);
      btnText.setDepth(503);

      btnBg.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(0x3a4a3a, 1);
        btnBg.fillRoundedRect(width / 2 - 150, y - 20, 300, 40, 8);
      });

      btnBg.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(0x2a2a2a, 1);
        btnBg.fillRoundedRect(width / 2 - 150, y - 20, 300, 40, 8);
      });

      btnBg.on('pointerdown', () => {
        this.loadLevel(levelId, savedLevels[levelId]);
        container.forEach(obj => {
          if ('destroy' in obj) {
            (obj as any).destroy();
          }
        });
      });

      container.push(btnBg, btnText);
    });

    // Close button
    const closeBtn = this.add.text(width / 2, height / 2 + panelHeight / 2 - 30, '❌ Close', {
      font: 'bold 16px Arial',
      color: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setDepth(502);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      container.forEach(obj => {
        if ('destroy' in obj) {
          (obj as any).destroy();
        }
      });
    });

    container.push(closeBtn);
  }

  private loadLevel(levelId: number, levelData: any): void {
    this.spawnPoints = levelData.spawnPoints || [];
    this.targetPoints = levelData.targetPoints || [];
    this.paths = levelData.paths || [];
    this.drawGrid();
    this.showNotification(`✅ Loaded Level ${levelId}`);
  }
}

