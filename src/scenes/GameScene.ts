/**
 * GameScene - Main gameplay scene
 */

import Phaser from 'phaser';
import { SCENES, GAME_CONFIG, COLORS } from '../config/game.config';
import { gameManager } from '../game/GameManager';
import { GridSystem } from '../systems/GridSystem';
import { WaveManager } from '../systems/WaveManager';
import { AbilitySystem } from '../systems/AbilitySystem';
import type { AbilityType } from '../systems/AbilitySystem';
import { TowerMenu } from '../ui/TowerMenu';
import { TowerInfoPanel } from '../ui/TowerInfoPanel';
import { AbilityBar } from '../ui/AbilityBar';
import { Tower } from '../entities/Tower';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import type { LevelData, TowerType, EnemyType } from '../types/phaser.types';
import { TOWER_CONFIGS, TOWER_DESCRIPTIONS } from '../config/towers.config';
import { CUSTOM_LEVELS, createLevelFromConfig } from '../config/levels.config';

export class GameScene extends Phaser.Scene {
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private gridSystem!: GridSystem;
  private waveManager!: WaveManager;
  private abilitySystem!: AbilitySystem;
  private towerMenu!: TowerMenu;
  private towerInfoPanel!: TowerInfoPanel;
  private abilityBar!: AbilityBar;
  private selectedTowerType: TowerType | null = null;
  private previewGraphics!: Phaser.GameObjects.Graphics;
  private previewSprite?: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  private towers: Tower[] = [];
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private startWaveButton!: Phaser.GameObjects.Container;
  private exitTestButton?: Phaser.GameObjects.Container;
  private level!: LevelData;
  private activeAbilities: Set<AbilityType> = new Set();
  private isTestMode: boolean = false;
  private waveCompleteRewardGiven: boolean = false;

  constructor() {
    super({ key: SCENES.GAME });
  }

  async create(): Promise<void> {
    console.log('🎮 GameScene: Initializing...');

    // Check if we have test level data from editor
    const testLevelData = localStorage.getItem('testLevelData');
    if (testLevelData) {
      console.log('🎨 Loading test level from editor...');
      this.level = this.createLevelFromEditorData(JSON.parse(testLevelData));
      this.isTestMode = true;
      localStorage.removeItem('testLevelData'); // Clear after loading
    } else {
      // Try to load from JSON file first
      const levelFromFile = await this.loadLevelFromFile(1);
      
      if (levelFromFile) {
        console.log('📄 Loading level from JSON file...');
        this.level = this.createLevelFromEditorData(levelFromFile);
      } else {
        // Try to load saved levels from localStorage
        const savedLevels = this.getSavedLevelsFromStorage();
        const savedLevelIds = Object.keys(savedLevels).map(Number).sort();
        
        if (savedLevelIds.length > 0) {
          // Load first saved level
          const levelId = savedLevelIds[0];
          console.log(`💾 Loading saved level ${levelId}...`);
          this.level = this.createLevelFromEditorData(savedLevels[levelId]);
        } else if (CUSTOM_LEVELS[1]) {
          // Try custom levels from config
          console.log('🎮 Loading custom level from config...');
          this.level = createLevelFromConfig(1, CUSTOM_LEVELS[1]);
        } else {
          // Fall back to default level
          console.log('🎮 Loading default level...');
          this.level = this.createMockLevel();
        }
      }
      this.isTestMode = false;
    }
    
    // Initialize game manager with level
    gameManager.initializeGame(this.level);

    // Initialize grid system
    this.gridSystem = new GridSystem();
    this.gridSystem.setPath(this.level.paths); // Pass all paths

    // Initialize wave manager
    this.waveManager = new WaveManager(this.level.waves);

    // Initialize ability system
    this.abilitySystem = new AbilitySystem();

    // Create grid
    this.createGrid();

    // Render decorations if any
    this.renderDecorations();

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

    // Create ability bar
    this.abilityBar = new AbilityBar(
      this,
      this.abilitySystem.getAllAbilities(),
      (type) => this.useAbility(type)
    );

    // Create start wave button
    this.createStartWaveButton();

    // Create exit test button if in test mode
    if (this.isTestMode) {
      this.createExitTestButton();
    }

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
    // Add background image
    const bg = this.add.image(0, 0, 'game_background');
    bg.setOrigin(0, 0);
    
    // Scale to fit screen
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    bg.setDepth(0);

    this.gridGraphics = this.add.graphics();
    this.gridGraphics.setDepth(1);
  }

  private renderDecorations(): void {
    // Render decorative objects if present in level
    if (this.level.decorations && this.level.decorations.length > 0) {
      const pathGridSize = GAME_CONFIG.PATH_GRID_SIZE;
      const decorSize = pathGridSize * 8; // 8x8 grid cells (64x64 pixels)
      this.level.decorations.forEach(decor => {
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
        
        dom.setDepth(2); // Above grid, below towers
      });
      console.log(`✨ Rendered ${this.level.decorations.length} decorations`);
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

    // Note: Tower already has spawn animation, remove duplicate
    // Flash effect on grid - expanding rings
    for (let i = 0; i < 3; i++) {
      const ring = this.add.circle(worldPos.x, worldPos.y, 20, 0x00ff00, 0);
      ring.setStrokeStyle(4, 0x00ff00);
      this.tweens.add({
        targets: ring,
        radius: 60,
        alpha: 0,
        duration: 500 + i * 100,
        delay: i * 50,
        ease: 'Quad.easeOut',
        onComplete: () => ring.destroy(),
      });
    }

    // Placement particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const particle = this.add.circle(worldPos.x, worldPos.y, 3, 0x00ff00);
      this.tweens.add({
        targets: particle,
        x: worldPos.x + Math.cos(angle) * 30,
        y: worldPos.y + Math.sin(angle) * 30,
        alpha: 0,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }

    // Camera shake for feedback
    this.cameras.main.shake(80, 0.003);

    // Show floating money text
    const cost = TOWER_CONFIGS[towerType].cost;
    const moneyText = this.add.text(worldPos.x, worldPos.y - 40, `-$${cost}`, {
      font: 'bold 20px Arial',
      color: '#ff9900',
      stroke: '#000000',
      strokeThickness: 4,
    });
    moneyText.setOrigin(0.5);
    this.tweens.add({
      targets: moneyText,
      y: worldPos.y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Quad.easeOut',
      onComplete: () => moneyText.destroy(),
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

    // Clear old preview sprite
    if (this.previewSprite) {
      this.previewSprite.destroy();
    }

    // Draw tower icon preview
    const desc = TOWER_DESCRIPTIONS[this.selectedTowerType];
    const iconKey = `icon_${this.selectedTowerType}`;
    
    if (this.textures.exists(iconKey)) {
      // Use icon image
      this.previewSprite = this.add.image(worldPos.x, worldPos.y, iconKey);
      this.previewSprite.setDisplaySize(32, 32);
      this.previewSprite.setAlpha(isValid ? 0.8 : 0.5);
      this.previewSprite.setDepth(50);
    } else {
      // Fallback to colored circle with letter
      const graphics = this.add.graphics();
      graphics.fillStyle(parseInt(desc.iconColor?.replace('#', '0x') || '0x00ff00', 16), isValid ? 0.8 : 0.5);
      graphics.fillCircle(worldPos.x, worldPos.y, 16);
      graphics.setDepth(50);
      this.previewSprite = graphics as any;
    }

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
      if (this.previewSprite) {
        this.previewSprite.destroy();
        this.previewSprite = undefined;
      }
    }
  }

  private showHint(message: string): void {
    const centerX = this.cameras.main.width / 2;
    const y = 100;

    // Create hint with better styling
    const hint = this.add.text(centerX, y - 30, message, {
      font: 'bold 18px Arial',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4,
      backgroundColor: '#000000cc',
      padding: { x: 20, y: 10 },
    });
    hint.setOrigin(0.5);
    hint.setDepth(200);
    hint.setAlpha(0);

    // Slide down and fade in
    this.tweens.add({
      targets: hint,
      y: y,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Fade out and slide up after 2.5 seconds
    this.tweens.add({
      targets: hint,
      alpha: 0,
      y: y - 20,
      duration: 400,
      delay: 2500,
      ease: 'Quad.easeIn',
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

    gameManager.on('game:over', (_score: number) => {
      this.onGameOver();
    });

    gameManager.on('game:victory', (_score: number) => {
      this.onVictory();
    });

    // Listen to enemy events
    this.events.on('enemy:reachedEnd', (enemyData: any) => {
      gameManager.damageErrorBudget(enemyData.errorBudgetDamage);
      this.waveManager.onEnemyReachedEnd();
      
      // Remove the specific enemy that reached the end (it's already destroyed)
      this.enemies = this.enemies.filter(e => e.active);
    });

    this.events.on('enemy:killed', (enemyData: any) => {
      gameManager.addMoney(enemyData.reward);
      gameManager.addScore(enemyData.reward * 10);
      this.waveManager.onEnemyKilled();
      
      // Remove enemy from array - find the dead enemy and show reward text
      const deadEnemy = this.enemies.find(e => e.active && e.getData().health <= 0);
      if (deadEnemy) {
        // Show floating reward text
        const rewardText = this.add.text(deadEnemy.x, deadEnemy.y - 20, `+$${enemyData.reward}`, {
          font: 'bold 18px Arial',
          color: '#00ff00',
          stroke: '#000000',
          strokeThickness: 4,
        });
        rewardText.setOrigin(0.5);
        this.tweens.add({
          targets: rewardText,
          y: deadEnemy.y - 60,
          alpha: 0,
          duration: 1000,
          ease: 'Quad.easeOut',
          onComplete: () => rewardText.destroy(),
        });
      }
      
      // Remove only dead/inactive enemies
      this.enemies = this.enemies.filter(e => e.active && e.getData().health > 0);
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

  private useAbility(type: AbilityType): void {
    const ability = this.abilitySystem.getAbility(type);
    if (!ability) return;

    const currentTime = this.time.now;

    // Check cooldown
    if (!this.abilitySystem.canUse(type, currentTime)) {
      const remaining = Math.ceil(this.abilitySystem.getCooldownRemaining(type, currentTime) / 1000);
      this.showHint(`⏱️ Cooldown: ${remaining}s remaining`);
      return;
    }

    // Check cost
    if (!gameManager.spendMoney(ability.cost)) {
      this.showHint(`❌ Not enough money! Need 💰${ability.cost}`);
      return;
    }

    // Use ability
    this.abilitySystem.use(type, currentTime);
    this.applyAbility(type, ability.duration);
    
    this.showHint(`✨ ${ability.name} activated!`);
  }

  private applyAbility(type: AbilityType, duration?: number): void {
    switch (type) {
      case 'scale_up':
        this.activeAbilities.add(type);
        console.log('⚡ Scale Up: All towers attack speed x2');
        
        // Visual effect on all towers - glow effect
        this.towers.forEach(tower => {
          // Add glow circle around tower
          const glow = this.add.circle(tower.x, tower.y, 30, 0x00ff00, 0.5);
          this.tweens.add({
            targets: glow,
            alpha: 0,
            radius: 50,
            duration: 300,
            onComplete: () => glow.destroy(),
          });
        });

        if (duration) {
          this.time.delayedCall(duration, () => {
            this.activeAbilities.delete(type);
            console.log('⚡ Scale Up ended');
          });
        }
        break;

      case 'emergency_cache':
        this.activeAbilities.add(type);
        console.log('🐌 Emergency Cache: All enemies slowed 50%');
        
        // Visual effect on all enemies
        this.enemies.forEach(enemy => {
          this.tweens.add({
            targets: enemy,
            alpha: 0.6,
            duration: 200,
          });
        });

        if (duration) {
          this.time.delayedCall(duration, () => {
            this.activeAbilities.delete(type);
            this.enemies.forEach(enemy => {
              this.tweens.add({
                targets: enemy,
                alpha: 1,
                duration: 200,
              });
            });
            console.log('🐌 Emergency Cache ended');
          });
        }
        break;

      case 'silence_alerts':
        // Find weakest enemy
        let weakestEnemy: Enemy | undefined = undefined;
        let lowestHealth = Infinity;
        
        this.enemies.forEach(enemy => {
          const health = enemy.getData().health;
          if (health > 0 && health < lowestHealth) {
            lowestHealth = health;
            weakestEnemy = enemy;
          }
        });

        if (weakestEnemy) {
          console.log('💀 Silence Alerts: Killed weakest enemy');
          const enemy: Enemy = weakestEnemy; // Type assertion for TypeScript
          enemy.takeDamage(9999);
          
          // Extra visual effect - expanding circle
          const flash = this.add.circle(enemy.x, enemy.y, 60, 0xff0000, 0);
          flash.setStrokeStyle(4, 0xff0000, 0.8);
          this.tweens.add({
            targets: flash,
            radius: 100,
            alpha: 0,
            duration: 500,
            onComplete: () => flash.destroy(),
          });
        }
        break;
    }
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

  private createExitTestButton(): void {
    const x = 120;
    const y = this.cameras.main.height - 70;

    // Button shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.5);
    shadow.fillRoundedRect(-82.5, -27.5, 165, 55, 12);

    // Button background with gradient
    const bg = this.add.graphics();
    bg.fillStyle(0xaa0000, 1);
    bg.fillRoundedRect(-80, -25, 160, 50, 12);
    
    // Inner highlight
    bg.fillStyle(0xffffff, 0.15);
    bg.fillRoundedRect(-75, -20, 150, 15, 10);
    
    // Border
    bg.lineStyle(2, 0xffffff, 0.3);
    bg.strokeRoundedRect(-80, -25, 160, 50, 12);

    // Interactive area
    const hitArea = this.add.rectangle(0, 0, 160, 50, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });

    // Button text with shadow
    const labelShadow = this.add.text(1, 1, '🔙 Exit Test', {
      font: 'bold 18px Arial',
      color: '#000000',
    });
    labelShadow.setOrigin(0.5);
    labelShadow.setAlpha(0.5);

    const label = this.add.text(0, 0, '🔙 Exit Test', {
      font: 'bold 18px Arial',
      color: '#ffffff',
    });
    label.setOrigin(0.5);

    this.exitTestButton = this.add.container(x, y, [shadow, bg, hitArea, labelShadow, label]);
    this.exitTestButton.setDepth(100);

    // Hover effects
    hitArea.on('pointerover', () => {
      this.tweens.add({
        targets: this.exitTestButton,
        scale: 1.05,
        duration: 150,
        ease: 'Back.easeOut',
      });
    });

    hitArea.on('pointerout', () => {
      this.tweens.add({
        targets: this.exitTestButton,
        scale: 1,
        duration: 150,
      });
    });

    hitArea.on('pointerdown', () => {
      this.tweens.add({
        targets: this.exitTestButton,
        scale: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: () => this.exitTestMode(),
      });
    });
  }

  private exitTestMode(): void {
    console.log('🔙 Exiting test mode...');
    gameManager.reset();
    this.scene.stop(SCENES.UI);
    this.scene.stop();
    this.scene.start(SCENES.LEVEL_EDITOR);
  }

  private createStartWaveButton(): void {
    const x = this.cameras.main.width - 120;
    const y = this.cameras.main.height - 70;

    // Button shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.5);
    shadow.fillRoundedRect(-82.5, -27.5, 165, 55, 12);

    // Button background with gradient
    const bg = this.add.graphics();
    bg.fillStyle(0x00aa00, 1);
    bg.fillRoundedRect(-80, -25, 160, 50, 12);
    
    // Inner highlight
    bg.fillStyle(0xffffff, 0.15);
    bg.fillRoundedRect(-75, -20, 150, 15, 10);
    
    // Border
    bg.lineStyle(2, 0xffffff, 0.3);
    bg.strokeRoundedRect(-80, -25, 160, 50, 12);

    // Interactive area
    const hitArea = this.add.rectangle(0, 0, 160, 50, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });

    // Button text with shadow
    const labelShadow = this.add.text(1, 1, 'Start Wave', {
      font: 'bold 18px Arial',
      color: '#000000',
    });
    labelShadow.setOrigin(0.5);
    labelShadow.setAlpha(0.5);

    const label = this.add.text(0, 0, 'Start Wave', {
      font: 'bold 18px Arial',
      color: '#ffffff',
    });
    label.setOrigin(0.5);

    this.startWaveButton = this.add.container(x, y, [shadow, bg, hitArea, labelShadow, label]);
    this.startWaveButton.setDepth(100);

    // Hover effects
    hitArea.on('pointerover', () => {
      this.tweens.add({
        targets: this.startWaveButton,
        scale: 1.05,
        duration: 150,
        ease: 'Back.easeOut',
      });
    });

    hitArea.on('pointerout', () => {
      this.tweens.add({
        targets: this.startWaveButton,
        scale: 1,
        duration: 150,
      });
    });

    hitArea.on('pointerdown', () => {
      this.tweens.add({
        targets: this.startWaveButton,
        scale: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: () => this.onStartWaveClick(),
      });
    });
  }

  private onStartWaveClick(): void {
    if (this.waveManager.isActive()) {
      console.log('⚠️ Wave already in progress');
      return;
    }

    if (this.waveManager.startNextWave()) {
      gameManager.startNextWave();
      this.startWaveButton.setVisible(false);
      this.waveCompleteRewardGiven = false; // Reset flag for new wave
      
      // Wave start visual effects
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      
      // Wave announcement
      const waveNum = gameManager.getState().currentWave;
      const announcement = this.add.text(centerX, centerY, `WAVE ${waveNum}`, {
        font: 'bold 72px Arial',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 8,
      });
      announcement.setOrigin(0.5);
      announcement.setDepth(300);
      announcement.setAlpha(0);
      
      // Animate announcement - fade in/out only
      this.tweens.add({
        targets: announcement,
        alpha: 1,
        duration: 300,
        ease: 'Quad.easeOut',
      });
      
      this.tweens.add({
        targets: announcement,
        alpha: 0,
        duration: 500,
        delay: 1500,
        onComplete: () => announcement.destroy(),
      });
      
      // Screen flash
      const flash = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xff0000, 0.3);
      flash.setOrigin(0, 0);
      flash.setDepth(299);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 300,
        onComplete: () => flash.destroy(),
      });
      
      // Camera shake
      this.cameras.main.shake(200, 0.005);
    } else {
      console.log('✅ All waves completed!');
    }
  }

  private spawnEnemy(type: EnemyType): void {
    // Randomly choose a path
    const pathIndex = Math.floor(Math.random() * this.level.paths.length);
    const path = this.level.paths[pathIndex];
    
    if (!path || path.length === 0) {
      console.error('❌ Invalid path selected!');
      return;
    }
    
    // Use the first point of the path as spawn point
    const spawnPoint = path[0];
    const worldPos = this.gridSystem.gridToWorld(spawnPoint.x, spawnPoint.y);
    
    const enemy = new Enemy(this, worldPos.x, worldPos.y, type, path);
    this.enemies.push(enemy);

    console.log(`👾 Spawned ${type} from path ${pathIndex + 1} at (${spawnPoint.x}, ${spawnPoint.y})`);
  }

  private spawnProjectile(tower: Tower, target: Enemy, damage: number): void {
    const projectile = new Projectile(this, tower.x, tower.y, target, damage);
    this.projectiles.push(projectile);
  }

  update(time: number, delta: number): void {
    // Wait for scene to be fully initialized
    if (!this.waveManager || !this.abilitySystem || !this.abilityBar) {
      return;
    }

    // Filter active enemies first
    this.enemies = this.enemies.filter(e => e.active);
    
    // Update all towers (pass enemies for targeting, with ability buffs)
    this.towers.forEach(tower => {
      // TODO: Implement Scale Up ability attack speed boost
      tower.update(time, delta, this.enemies);
    });

    // Update all enemies (with ability slow)
    const enemySlowMultiplier = this.activeAbilities.has('emergency_cache') ? 0.5 : 1;
    
    this.enemies.forEach(enemy => {
      // Skip if enemy became inactive during this frame
      if (!enemy.active) return;
      
      // Apply slow if Emergency Cache is active
      const slowedDelta = delta * enemySlowMultiplier;
      enemy.update(time, slowedDelta);
    });

    // Update all projectiles
    this.projectiles = this.projectiles.filter(projectile => {
      return projectile.update(delta);
    });

    // Update wave manager
    this.waveManager.update(delta, (type) => this.spawnEnemy(type));

    // Update ability cooldowns display
    const cooldowns = new Map<AbilityType, number>();
    this.abilitySystem.getAllAbilities().forEach(ability => {
      const remaining = this.abilitySystem.getCooldownRemaining(ability.type, time);
      cooldowns.set(ability.type, remaining);
    });
    this.abilityBar.updateCooldowns(cooldowns);

    // Check if wave completed
    if (!this.waveManager.isActive() && this.enemies.length === 0) {
      if (!this.waveManager.isAllWavesComplete()) {
        this.startWaveButton.setVisible(true);
        
        // Award wave completion bonus (only once)
        if (!this.waveCompleteRewardGiven) {
          this.waveCompleteRewardGiven = true;
          const reward = this.waveManager.getWaveReward();
          if (reward > 0) {
            gameManager.addMoney(reward);
            gameManager.completeWave();
            
            // Wave complete celebration
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;
            
            const completeText = this.add.text(centerX, centerY, `WAVE COMPLETE!\n+$${reward}`, {
              font: 'bold 48px Arial',
              color: '#00ff00',
              stroke: '#000000',
              strokeThickness: 6,
              align: 'center',
            });
            completeText.setOrigin(0.5);
            completeText.setDepth(300);
            completeText.setAlpha(0);
            
            this.tweens.add({
              targets: completeText,
              alpha: 1,
              duration: 400,
              ease: 'Quad.easeOut',
            });
            
            this.tweens.add({
              targets: completeText,
              alpha: 0,
              duration: 400,
              delay: 1500,
              onComplete: () => completeText.destroy(),
            });
          }
        }
      } else {
        // All waves completed - victory!
        gameManager.emit('game:victory', gameManager.getState().score);
      }
    }
  }

  private async loadLevelFromFile(levelId: number): Promise<any | null> {
    try {
      const basePath = import.meta.env.BASE_URL || '/';
      const response = await fetch(`${basePath}levels/level-${levelId}.json`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Loaded level-${levelId}.json from file`);
        return data;
      }
    } catch (error) {
      console.log(`ℹ️ No level-${levelId}.json file found`);
    }
    return null;
  }

  private getSavedLevelsFromStorage(): Record<number, any> {
    const saved = localStorage.getItem('savedCustomLevels');
    return saved ? JSON.parse(saved) : {};
  }

  private createLevelFromEditorData(editorData: any): LevelData {
    return {
      id: 999,
      name: 'Test Level',
      description: 'Level from editor',
      gridWidth: editorData.gridWidth || GAME_CONFIG.PATH_GRID_COLS,
      gridHeight: editorData.gridHeight || GAME_CONFIG.PATH_GRID_ROWS,
      spawnPoints: editorData.spawnPoints,
      targetPoints: editorData.targetPoints,
      paths: editorData.paths,
      decorations: editorData.decorations || [], // Add decorations
      buildableArea: [],
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
            { type: 'ddos', count: 3, interval: 1000 },
            { type: 'traffic_spike', count: 4, interval: 600 },
          ],
          reward: 200,
        },
      ],
      startingMoney: 500,
      startingErrorBudget: 100,
    };
  }

  private createMockLevel(): LevelData {
    // Datacenter is in the center at approximately (10, 5)
    const datacenterPos = { x: 10, y: 5 };
    
    return {
      id: 1,
      name: 'Infrastructure Defense',
      description: 'Defend the datacenter from all sides!',
      gridWidth: GAME_CONFIG.GRID_COLS,
      gridHeight: GAME_CONFIG.GRID_ROWS,
      // Multiple spawn points from different directions
      spawnPoints: [
        { x: 0, y: 2 },   // Left
        { x: 19, y: 2 },  // Right
        { x: 10, y: 0 },  // Top
        { x: 10, y: 10 }, // Bottom
      ],
      targetPoints: [datacenterPos],
      paths: [
        // Path 1: From left to center
        [
          { x: 0, y: 2 },
          { x: 1, y: 2 },
          { x: 2, y: 2 },
          { x: 3, y: 2 },
          { x: 4, y: 2 },
          { x: 4, y: 3 },
          { x: 4, y: 4 },
          { x: 5, y: 4 },
          { x: 6, y: 4 },
          { x: 7, y: 4 },
          { x: 8, y: 4 },
          { x: 8, y: 5 },
          { x: 9, y: 5 },
          { x: 10, y: 5 },
        ],
        // Path 2: From right to center
        [
          { x: 19, y: 2 },
          { x: 18, y: 2 },
          { x: 17, y: 2 },
          { x: 16, y: 2 },
          { x: 15, y: 2 },
          { x: 15, y: 3 },
          { x: 15, y: 4 },
          { x: 14, y: 4 },
          { x: 13, y: 4 },
          { x: 12, y: 4 },
          { x: 11, y: 4 },
          { x: 11, y: 5 },
          { x: 10, y: 5 },
        ],
        // Path 3: From top to center
        [
          { x: 10, y: 0 },
          { x: 10, y: 1 },
          { x: 10, y: 2 },
          { x: 10, y: 3 },
          { x: 10, y: 4 },
          { x: 10, y: 5 },
        ],
        // Path 4: From bottom to center
        [
          { x: 10, y: 10 },
          { x: 10, y: 9 },
          { x: 10, y: 8 },
          { x: 10, y: 7 },
          { x: 10, y: 6 },
          { x: 10, y: 5 },
        ],
      ],
      buildableArea: [], // Will be filled based on paths
      decorations: [], // No decorations in default level
      waves: [
        {
          waveNumber: 1,
          enemies: [
            { type: 'traffic_spike', count: 6, interval: 1000 },
          ],
          reward: 100,
        },
        {
          waveNumber: 2,
          enemies: [
            { type: 'traffic_spike', count: 4, interval: 800 },
            { type: 'memory_leak', count: 3, interval: 1500 },
          ],
          reward: 150,
        },
        {
          waveNumber: 3,
          enemies: [
            { type: 'ddos', count: 4, interval: 1000 },
            { type: 'traffic_spike', count: 5, interval: 600 },
          ],
          reward: 200,
        },
        {
          waveNumber: 4,
          enemies: [
            { type: 'memory_leak', count: 4, interval: 1200 },
            { type: 'slow_query', count: 2, interval: 2000 },
          ],
          reward: 250,
        },
        {
          waveNumber: 5,
          enemies: [
            { type: 'ddos', count: 5, interval: 900 },
            { type: 'memory_leak', count: 3, interval: 1300 },
            { type: 'slow_query', count: 2, interval: 1800 },
          ],
          reward: 300,
        },
        {
          waveNumber: 6,
          enemies: [
            { type: 'friday_deploy', count: 1, interval: 3000 },
            { type: 'ddos', count: 6, interval: 800 },
            { type: 'traffic_spike', count: 8, interval: 500 },
          ],
          reward: 400,
        },
      ],
      startingMoney: GAME_CONFIG.STARTING_MONEY,
      startingErrorBudget: GAME_CONFIG.STARTING_ERROR_BUDGET,
    };
  }
}

