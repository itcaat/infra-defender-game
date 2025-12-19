/**
 * BootScene - Initial setup and configuration
 */

import Phaser from 'phaser';
import { SCENES } from '../config/game.config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload(): void {
    // Set up basic loading configurations
    console.log('🔧 BootScene: Setting up game...');
  }

  create(): void {
    console.log('✅ BootScene: Complete');
    
    // Start the preload scene
    this.scene.start(SCENES.PRELOAD);
  }
}

