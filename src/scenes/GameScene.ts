/**
 * GameScene - Main gameplay scene
 */

import Phaser from 'phaser';
import { SCENES, GAME_CONFIG, COLORS } from '../config/game.config';
import { gameManager } from '../game/GameManager';
import { GridSystem } from '../systems/GridSystem';
import { WaveManager } from '../systems/WaveManager';
import { TowerMenu } from '../ui/TowerMenu';
import { TowerInfoPanel } from '../ui/TowerInfoPanel';
import { Tower } from '../entities/Tower';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import type { LevelData, GridPosition, TowerType, EnemyType } from '../types/phaser.types';
import { TOWER_CONFIGS } from '../config/towers.config';

export class GameScene extends Phaser.Scene {
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private gridSystem!: GridSystem;
  private waveManager!: WaveManager;
  private towerMenu!: TowerMenu;
  private towerInfoPanel!: TowerInfoPanel;
  private selectedTowerType: TowerType | null = null;
  private previewGraphics!: Phaser.GameObjects.Graphics;
  private towers: Tower[] = [];
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private startWaveButton!: Phaser.GameObjects.Container;
  private level!: LevelData;

  constructor() {
    super({ key: SCENES.GAME });
  }

  create(): void {
    console.log('🎮 GameScene: Initializing...');

    // Create mock level data
    this.level = this.createMockLevel();
    
    // Initialize game manager with level
    gameManager.initializeGame(this.level);

    // Initialize grid system
    this.gridSystem = new GridSystem();
    this.gridSystem.setPath(this.level.paths[0]);

    // Initialize wave manager
    this.waveManager = new WaveManager(this.level.waves);

    // Create grid
    this.createGrid();

    // Create preview graphics
    this.previewGraphics = this.add.graphics();
    this.previewGraphics.setDepth(50);

    // Create tower menu
    this.towerMenu = new TowerMenu(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height - 70,
      (towerType) => this.onTowerSelected(towerType)
    );
    this.towerMenu.setDepth(100);

    // Create tower info panel
    this.towerInfoPanel = new TowerInfoPanel(
      this,
      (tower) => this.upgradeTower(tower),
      (tower) => this.sellTower(tower)
    );

    // Create start wave button
    this.createStartWaveButton();

    // Setup input
    this.setupInput();

    // Listen to game manager events
    this.setupGameEvents();

    // Add tutorial text
    this.addTutorialText();

    console.log('✅ GameScene: Ready');
    console.log('💡 Click a tower below to select it, then click on the grid to place!');
  }

  private addTutorialText(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const tutorialText = this.add.text(centerX, centerY - 100, 
      '👇 Click a tower below to select it\nThen click on the grid to place!', {
      font: 'bold 24px Arial',
      color: '#00ff00',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
    });
    tutorialText.setOrigin(0.5);
    tutorialText.setDepth(200);
    tutorialText.setAlpha(0.9);

    // Make it blink
    this.tweens.add({
      targets: tutorialText,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        tutorialText.destroy();
      }
    });
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

    // Draw path cells
    const level = gameManager.getLevel();
    if (level) {
      this.gridGraphics.fillStyle(COLORS.PATH, 0.3);
      level.paths[0].forEach(pos => {
        const worldPos = this.gridSystem.gridToWorld(pos.x, pos.y);
        this.gridGraphics.fillRect(
          worldPos.x - gridSize / 2,
          worldPos.y - gridSize / 2,
          gridSize,
          gridSize
        );
      });
    }
  }

  private setupInput(): void {
    // ESC to pause
    this.input.keyboard?.on('keydown-ESC', () => {
      this.pauseGame();
    });

    // Grid click handler
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Don't process clicks on UI elements (bottom 150px and right 150px)
      if (pointer.y > this.cameras.main.height - 150) return;
      if (pointer.x > this.cameras.main.width - 150 && pointer.y > this.cameras.main.height - 150) return;
      
      this.handleGridClick(pointer.x, pointer.y);
    });

    // Mouse move handler for preview
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.updatePlacementPreview(pointer.x, pointer.y);
    });
  }

  private handleGridClick(worldX: number, worldY: number): void {
    // Close tower info panel if open
    if (this.towerInfoPanel.isVisible()) {
      this.towerInfoPanel.hide();
    }

    if (!this.selectedTowerType) {
      this.showHint('Select a tower from the menu below first!');
      return;
    }

    const gridPos = this.gridSystem.worldToGrid(worldX, worldY);

    // Check if placement is valid
    if (!this.gridSystem.isValidPlacement(gridPos.x, gridPos.y)) {
      console.log('❌ Invalid placement position');
      this.showHint("Can't place here! Try another spot.");
      return;
    }

    // Check if player has enough money
    const towerConfig = TOWER_CONFIGS[this.selectedTowerType];
    if (!gameManager.spendMoney(towerConfig.cost)) {
      console.log('❌ Not enough money!');
      this.showHint(`Not enough money! Need 💰${towerConfig.cost}`);
      return;
    }

    // Place the tower
    this.placeTower(this.selectedTowerType, gridPos.x, gridPos.y);

    // Clear selection
    this.towerMenu.clearSelection();
    this.selectedTowerType = null;
  }

  private placeTower(towerType: TowerType, gridX: number, gridY: number): void {
    const worldPos = this.gridSystem.gridToWorld(gridX, gridY);
    
    // Create tower entity
    const tower = new Tower(this, worldPos.x, worldPos.y, towerType);
    this.towers.push(tower);

    // Mark cell as occupied
    this.gridSystem.occupyCell(gridX, gridY);

    // Placement animation
    tower.setScale(0);
    tower.setAlpha(0);
    this.tweens.add({
      targets: tower,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Flash effect on grid
    const flash = this.add.circle(worldPos.x, worldPos.y, 40, 0x00ff00, 0.5);
    this.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 400,
      onComplete: () => flash.destroy(),
    });

    this.showHint(`✅ ${towerType} placed!`);
    console.log(`✅ Placed ${towerType} at (${gridX}, ${gridY})`);
  }

  private updatePlacementPreview(worldX: number, worldY: number): void {
    this.previewGraphics.clear();

    if (!this.selectedTowerType) return;

    const gridPos = this.gridSystem.worldToGrid(worldX, worldY);
    const worldPos = this.gridSystem.gridToWorld(gridPos.x, gridPos.y);
    const isValid = this.gridSystem.isValidPlacement(gridPos.x, gridPos.y);

    // Draw cell highlight
    const gridSize = GAME_CONFIG.GRID_SIZE;
    const color = isValid ? COLORS.GRID_VALID : COLORS.GRID_INVALID;
    this.previewGraphics.fillStyle(color, 0.5);
    this.previewGraphics.fillRect(
      worldPos.x - gridSize / 2,
      worldPos.y - gridSize / 2,
      gridSize,
      gridSize
    );

    // Draw range preview if valid
    if (isValid) {
      const towerConfig = TOWER_CONFIGS[this.selectedTowerType];
      this.previewGraphics.lineStyle(2, COLORS.TOWER, 0.5);
      this.previewGraphics.strokeCircle(worldPos.x, worldPos.y, towerConfig.range);
    }
  }

  private onTowerSelected(towerType: TowerType | null): void {
    this.selectedTowerType = towerType;
    if (towerType) {
      const config = TOWER_CONFIGS[towerType];
      console.log(`🔨 Selected tower: ${towerType} (💰${config.cost})`);
      
      // Show selection hint
      this.showHint(`${towerType} selected! Click on the grid to place.`);
    } else {
      console.log('❌ Tower selection cancelled');
      this.previewGraphics.clear();
    }
  }

  private showHint(message: string): void {
    const centerX = this.cameras.main.width / 2;
    const y = 100;

    const hint = this.add.text(centerX, y, message, {
      font: 'bold 18px Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 },
    });
    hint.setOrigin(0.5);
    hint.setDepth(200);

    // Fade out after 2 seconds
    this.tweens.add({
      targets: hint,
      alpha: 0,
      y: y - 20,
      duration: 2000,
      delay: 1000,
      onComplete: () => hint.destroy()
    });
  }

  private setupGameEvents(): void {
    gameManager.on('money:changed', (money: number) => {
      console.log('💰 Money:', money);
    });

    gameManager.on('errorBudget:changed', (errorBudget: number) => {
      console.log('❤️ Error Budget:', errorBudget);
      if (errorBudget <= 0) {
        this.onGameOver();
      }
    });

    gameManager.on('wave:started', (wave: number) => {
      console.log('🌊 Wave started:', wave);
    });

    gameManager.on('game:over', (score: number) => {
      this.onGameOver();
    });

    gameManager.on('game:victory', (score: number) => {
      this.onVictory();
    });

    // Listen to enemy events
    this.events.on('enemy:reachedEnd', (enemyData: any) => {
      gameManager.damageErrorBudget(enemyData.errorBudgetDamage);
      this.waveManager.onEnemyReachedEnd();
      
      // Remove enemy from array
      this.enemies = this.enemies.filter(e => e.getData().health > 0);
    });

    this.events.on('enemy:killed', (enemyData: any) => {
      gameManager.addMoney(enemyData.reward);
      gameManager.addScore(enemyData.reward * 10);
      this.waveManager.onEnemyKilled();
      
      // Remove enemy from array
      this.enemies = this.enemies.filter(e => e.getData().health > 0);
    });

    // Listen to tower attack events
    this.events.on('tower:attack', (data: { tower: Tower; target: Enemy; damage: number }) => {
      this.spawnProjectile(data.tower, data.target, data.damage);
    });

    // Listen to tower selection events
    this.events.on('tower:selected', (tower: Tower) => {
      this.onTowerClicked(tower);
    });
  }

  private onTowerClicked(tower: Tower): void {
    // Close tower menu selection
    this.towerMenu.clearSelection();
    this.selectedTowerType = null;
    this.previewGraphics.clear();

    // Show info panel
    this.towerInfoPanel.show(tower);
    console.log('🔍 Tower selected for info');
  }

  private upgradeTower(tower: Tower): void {
    const data = tower.getData();
    
    if (gameManager.spendMoney(data.upgradeCost)) {
      tower.upgrade();
      this.showHint(`✨ Tower upgraded to Level ${data.level + 1}!`);
    } else {
      this.showHint(`❌ Not enough money! Need 💰${data.upgradeCost}`);
    }
  }

  private sellTower(tower: Tower): void {
    const data = tower.getData();
    const sellValue = Math.round(data.cost * 0.7);
    
    // Get tower grid position
    const gridPos = this.gridSystem.worldToGrid(tower.x, tower.y);
    
    // Free the cell
    this.gridSystem.freeCell(gridPos.x, gridPos.y);
    
    // Remove tower
    this.towers = this.towers.filter(t => t !== tower);
    tower.destroy();
    
    // Give money back
    gameManager.addMoney(sellValue);
    
    this.showHint(`💰 Tower sold for ${sellValue}`);
    console.log(`💰 Sold tower for ${sellValue}`);
  }

  private onGameOver(): void {
    console.log('💀 Game Over! Score:', gameManager.getState().score);
    this.scene.stop(SCENES.UI);
    this.scene.start(SCENES.GAME_OVER);
  }

  private onVictory(): void {
    console.log('🎉 Victory! Score:', gameManager.getState().score);
    this.scene.stop(SCENES.UI);
    this.scene.start(SCENES.VICTORY);
  }

  private pauseGame(): void {
    gameManager.pause();
    this.scene.pause();
    this.scene.launch(SCENES.PAUSE);
  }

  private createStartWaveButton(): void {
    const x = this.cameras.main.width - 100;
    const y = this.cameras.main.height - 70;

    const bg = this.add.rectangle(0, 0, 120, 50, 0x00aa00);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, 'Start Wave', {
      font: 'bold 16px Arial',
      color: '#ffffff',
    });
    label.setOrigin(0.5);

    this.startWaveButton = this.add.container(x, y, [bg, label]);
    this.startWaveButton.setDepth(100);

    bg.on('pointerover', () => bg.setFillStyle(0x00ff00));
    bg.on('pointerout', () => bg.setFillStyle(0x00aa00));
    bg.on('pointerdown', () => this.onStartWaveClick());
  }

  private onStartWaveClick(): void {
    if (this.waveManager.isActive()) {
      console.log('⚠️ Wave already in progress');
      return;
    }

    if (this.waveManager.startNextWave()) {
      gameManager.startNextWave();
      this.startWaveButton.setVisible(false);
    } else {
      console.log('✅ All waves completed!');
    }
  }

  private spawnEnemy(type: EnemyType): void {
    const spawnPoint = this.level.spawnPoints[0];
    const worldPos = this.gridSystem.gridToWorld(spawnPoint.x, spawnPoint.y);
    
    const enemy = new Enemy(this, worldPos.x, worldPos.y, type, this.level.paths[0]);
    this.enemies.push(enemy);

    console.log(`👾 Spawned ${type}`);
  }

  private spawnProjectile(tower: Tower, target: Enemy, damage: number): void {
    const projectile = new Projectile(this, tower.x, tower.y, target, damage);
    this.projectiles.push(projectile);
  }

  update(time: number, delta: number): void {
    // Update all towers (pass enemies for targeting)
    this.towers.forEach(tower => tower.update(time, delta, this.enemies));

    // Update all enemies
    this.enemies.forEach(enemy => enemy.update(time, delta));

    // Update all projectiles
    this.projectiles = this.projectiles.filter(projectile => {
      return projectile.update(delta);
    });

    // Update wave manager
    this.waveManager.update(delta, (type) => this.spawnEnemy(type));

    // Check if wave completed
    if (!this.waveManager.isActive() && this.enemies.length === 0) {
      if (!this.waveManager.isAllWavesComplete()) {
        this.startWaveButton.setVisible(true);
        
        // Award wave completion bonus
        const reward = this.waveManager.getWaveReward();
        if (reward > 0) {
          gameManager.addMoney(reward);
          gameManager.completeWave();
        }
      } else {
        // All waves completed - victory!
        gameManager.emit('game:victory', gameManager.getState().score);
      }
    }
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
        {
          waveNumber: 2,
          enemies: [
            { type: 'traffic_spike', count: 3, interval: 800 },
            { type: 'memory_leak', count: 2, interval: 1500 },
          ],
          reward: 150,
        },
        {
          waveNumber: 3,
          enemies: [
            { type: 'ddos', count: 3, interval: 1200 },
            { type: 'slow_query', count: 1, interval: 2000 },
          ],
          reward: 200,
        },
      ],
      startingMoney: GAME_CONFIG.STARTING_MONEY,
      startingErrorBudget: GAME_CONFIG.STARTING_ERROR_BUDGET,
    };
  }
}

