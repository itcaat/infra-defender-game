/**
 * PreloadScene - Load all game assets
 */

import Phaser from 'phaser';
import { SCENES } from '../config/game.config';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PRELOAD });
  }

  preload(): void {
    console.log('📦 PreloadScene: Loading assets...');

    // Load game background
    this.load.image('game_background', 'game-background.png');

    // Load tower icons
    this.load.image('icon_nginx', 'icons/nginx.svg');
    this.load.image('icon_redis', 'icons/redis.svg');
    this.load.image('icon_kafka', 'icons/kafka.svg');
    this.load.image('icon_postgresql', 'icons/postgresql.svg');
    this.load.image('icon_api_gateway', 'icons/api-gateway.svg');
    this.load.image('icon_prometheus', 'icons/prometheus.svg');
    this.load.image('icon_clickhouse', 'icons/clickhouse.svg');

    // Create loading bar
    this.createLoadingBar();

    // TODO: Load assets here when we have them
    // this.load.image('tower_nginx', 'assets/towers/nginx.png');
    // this.load.spritesheet('enemy_ddos', 'assets/enemies/ddos.png', { frameWidth: 32, frameHeight: 32 });
    
    // For now, just simulate loading
    this.load.on('progress', (value: number) => {
      console.log(`Loading: ${Math.round(value * 100)}%`);
    });
  }

  create(): void {
    console.log('✅ PreloadScene: Assets loaded');
    
    // Start the main menu
    this.scene.start(SCENES.MAIN_MENU);
  }

  private createLoadingBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '24px Arial',
      color: '#00ff00',
    });
    loadingText.setOrigin(0.5);

    // Progress bar background
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2, 320, 30);

    // Progress bar
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 10);
    });

    // Clean up when complete
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }
}

