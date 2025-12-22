/**
 * MainMenuScene - Main menu and level selection
 */

import Phaser from 'phaser';
import { SCENES } from '../config/game.config';
import { userManager } from '../utils/UserManager';

export class MainMenuScene extends Phaser.Scene {
  private nicknameText!: Phaser.GameObjects.Text;
  private nicknameInputBg!: Phaser.GameObjects.Graphics;
  private cursorText!: Phaser.GameObjects.Text;
  private startButtonBg!: Phaser.GameObjects.Graphics;
  private startButtonLabel!: Phaser.GameObjects.Text;
  private isInputActive: boolean = false;

  constructor() {
    super({ key: SCENES.MAIN_MENU });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add background image
    const bg = this.add.image(0, 0, 'game_background');
    bg.setOrigin(0, 0);
    
    // Scale to fit screen
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    bg.setDepth(0);

    // Add dark overlay to make text more readable
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1);

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

    // Title with effects
    const titleShadow = this.add.text(width / 2 + 4, height / 4 + 4, 'INFRA DEFENDER', {
      font: 'bold 64px Arial',
      color: '#000000',
    });
    titleShadow.setOrigin(0.5);
    titleShadow.setAlpha(0.5);
    titleShadow.setDepth(10);
    
    const titleGlow = this.add.text(width / 2, height / 4, 'INFRA DEFENDER', {
      font: 'bold 64px Arial',
      color: theme.buttonColor,
      stroke: theme.buttonColor,
      strokeThickness: 15,
    });
    titleGlow.setOrigin(0.5);
    titleGlow.setAlpha(0.3);
    titleGlow.setDepth(10);
    
    const title = this.add.text(width / 2, height / 4, 'INFRA DEFENDER', {
      font: 'bold 64px Arial',
      color: theme.buttonColor,
      stroke: '#000000',
      strokeThickness: 6,
    });
    title.setOrigin(0.5);
    title.setDepth(10);
    
    // Pulsing animation
    this.tweens.add({
      targets: [titleGlow],
      scale: 1.05,
      alpha: 0.4,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle with panel
    const subtitlePanel = this.add.graphics();
    subtitlePanel.fillStyle(0x0a0a0a, 0.7);
    subtitlePanel.fillRoundedRect(width / 2 - 180, height / 4 + 54, 360, 36, 18);
    subtitlePanel.lineStyle(2, parseInt(theme.buttonColor.replace('#', '0x'), 16), 0.5);
    subtitlePanel.strokeRoundedRect(width / 2 - 180, height / 4 + 54, 360, 36, 18);
    subtitlePanel.setDepth(10);
    
    const subtitle = this.add.text(width / 2, height / 4 + 72, '🛡️ Protect Your Infrastructure!', {
      font: 'bold 20px Arial',
      color: theme.textColor,
      stroke: '#000000',
      strokeThickness: 3,
    });
    subtitle.setOrigin(0.5);
    subtitle.setDepth(10);

    // Nickname input with label (compact design)
    const nicknameY = height / 2 - 70;
    
    // Nickname label
    const nicknameLabel = this.add.text(width / 2, nicknameY - 30, '👤 Your Nickname:', {
      font: 'bold 18px Arial',
      color: theme.buttonColor,
    });
    nicknameLabel.setOrigin(0.5);
    nicknameLabel.setDepth(11);

    // Nickname input field (Phaser-based)
    this.createNicknameInput(width / 2, nicknameY + 15);

    // Start button (closer spacing)
    this.createStartButton(width / 2, height / 2 + 30);

    // Leaderboard button
    this.createButton(
      width / 2,
      height / 2 + 110,
      'LEADERBOARD',
      () => console.log('Leaderboard - Coming soon!')
    );

    // Level Editor button (dev mode only)
    const isDev = import.meta.env.DEV || window.location.search.includes('dev');
    if (isDev) {
      const editorButton = this.createButton(
        width / 2,
        height / 2 + 190,
        '🎨 LEVEL EDITOR',
        () => this.openLevelEditor()
      );
      editorButton.setAlpha(0.8); // Slightly transparent to indicate dev feature
    }

    // Version info
    const version = this.add.text(width - 10, height - 10, 'v0.0.1 - MVP', {
      font: '14px Arial',
      color: theme.hintColor,
    });
    version.setOrigin(1, 1);
    version.setDepth(10);

    console.log('🏠 MainMenuScene: Ready');
  }

  private createButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const theme = {
      buttonColor: '#4CAF50',
      buttonTextColor: '#ffffff',
    };

    // Button shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.5);
    shadow.fillRoundedRect(-150 + 3, -25 + 3, 300, 50, 12);

    // Button background with gradient
    const bg = this.add.graphics();
    bg.fillStyle(parseInt(theme.buttonColor.replace('#', '0x'), 16), 1);
    bg.fillRoundedRect(-150, -25, 300, 50, 12);
    
    // Inner highlight
    bg.fillStyle(0xffffff, 0.15);
    bg.fillRoundedRect(-145, -20, 290, 15, 10);
    
    // Border
    bg.lineStyle(2, 0xffffff, 0.3);
    bg.strokeRoundedRect(-150, -25, 300, 50, 12);

    // Interactive area
    const hitArea = this.add.rectangle(0, 0, 300, 50, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });

    // Button text with shadow
    const labelShadow = this.add.text(1, 1, text, {
      font: 'bold 20px Arial',
      color: '#000000',
    });
    labelShadow.setOrigin(0.5);
    labelShadow.setAlpha(0.5);

    const label = this.add.text(0, 0, text, {
      font: 'bold 20px Arial',
      color: theme.buttonTextColor,
    });
    label.setOrigin(0.5);

    // Container
    const button = this.add.container(x, y, [shadow, bg, hitArea, labelShadow, label]);
    button.setDepth(10);

    // Hover effects
    hitArea.on('pointerover', () => {
      this.tweens.add({
        targets: button,
        scale: 1.05,
        duration: 150,
        ease: 'Back.easeOut',
      });
    });

    hitArea.on('pointerout', () => {
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
      });
    });

    hitArea.on('pointerdown', () => {
      this.tweens.add({
        targets: button,
        scale: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: onClick,
      });
    });

    return button;
  }

  private startGame(): void {
    // Validate nickname before starting
    if (!this.isNicknameValid()) {
      console.log('⚠️ Cannot start game: nickname is required');
      
      // Shake the input field
      if (this.nicknameText) {
        this.activateInput();
        this.tweens.add({
          targets: [this.nicknameText, this.nicknameInputBg, this.cursorText],
          x: '+=10',
          duration: 50,
          yoyo: true,
          repeat: 3,
        });
      }
      
      return;
    }
    
    // Save nickname before starting
    this.saveNickname();
    
    console.log('🎮 Starting game...');
    
    // Start both game and UI scenes
    this.scene.start(SCENES.GAME);
    this.scene.launch(SCENES.UI);
  }

  private createNicknameInput(x: number, y: number): void {
    const currentNickname = userManager.hasProfile() ? userManager.getNickname() : '';
    const inputWidth = 320;
    const inputHeight = 50;

    // Input background
    this.nicknameInputBg = this.add.graphics();
    this.drawInputBackground(x, y, inputWidth, inputHeight, false);

    // Input text
    this.nicknameText = this.add.text(x, y, currentNickname || 'Click to enter nickname', {
      font: '20px Arial',
      color: currentNickname ? '#333333' : '#999999',
      align: 'center',
    });
    this.nicknameText.setOrigin(0.5);
    this.nicknameText.setDepth(12);

    // Blinking cursor
    this.cursorText = this.add.text(0, y, '|', {
      font: '20px Arial',
      color: '#333333',
    });
    this.cursorText.setOrigin(0.5);
    this.cursorText.setDepth(12);
    this.cursorText.setVisible(false);

    // Blinking animation
    this.tweens.add({
      targets: this.cursorText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Make interactive
    const hitArea = this.add.rectangle(x, y, inputWidth, inputHeight, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.setDepth(11);

    hitArea.on('pointerdown', () => {
      this.activateInput();
    });

    // Keyboard input
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (!this.isInputActive) return;

      const currentText = this.nicknameText.text === 'Click to enter nickname' ? '' : this.nicknameText.text;

      if (event.key === 'Backspace') {
        if (currentText.length > 0) {
          const newText = currentText.slice(0, -1);
          this.nicknameText.setText(newText || 'Click to enter nickname');
          this.nicknameText.setColor(newText ? '#333333' : '#999999');
          this.updateCursorPosition();
          this.updateStartButtonState();
        }
      } else if (event.key === 'Enter') {
        this.deactivateInput();
        this.saveNickname();
      } else if (event.key === 'Escape') {
        this.deactivateInput();
      } else if (event.key.length === 1 && currentText.length < 20) {
        const newText = currentText + event.key;
        this.nicknameText.setText(newText);
        this.nicknameText.setColor('#333333');
        this.updateCursorPosition();
        this.updateStartButtonState();
      }
    });

    // Click outside to deactivate
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isInputActive) {
        if (!Phaser.Geom.Rectangle.Contains(
          new Phaser.Geom.Rectangle(x - inputWidth / 2, y - inputHeight / 2, inputWidth, inputHeight),
          pointer.x,
          pointer.y
        )) {
          this.deactivateInput();
          this.saveNickname();
        }
      }
    });

    this.updateStartButtonState();
  }

  private drawInputBackground(x: number, y: number, width: number, height: number, active: boolean): void {
    this.nicknameInputBg.clear();
    
    // Background
    this.nicknameInputBg.fillStyle(0xffffff, 0.95);
    this.nicknameInputBg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    
    // Border
    const borderColor = active ? 0x66BB6A : 0x4CAF50;
    const borderWidth = active ? 3 : 3;
    this.nicknameInputBg.lineStyle(borderWidth, borderColor, 1);
    this.nicknameInputBg.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    
    // Glow effect when active
    if (active) {
      this.nicknameInputBg.lineStyle(8, 0x4CAF50, 0.3);
      this.nicknameInputBg.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    }
    
    this.nicknameInputBg.setDepth(11);
  }

  private activateInput(): void {
    this.isInputActive = true;
    const bounds = this.nicknameText.getBounds();
    this.drawInputBackground(bounds.centerX, bounds.centerY, 320, 50, true);
    
    // Clear placeholder
    if (this.nicknameText.text === 'Click to enter nickname') {
      this.nicknameText.setText('');
      this.nicknameText.setColor('#333333');
    }
    
    this.cursorText.setVisible(true);
    this.updateCursorPosition();
  }

  private deactivateInput(): void {
    this.isInputActive = false;
    const bounds = this.nicknameText.getBounds();
    this.drawInputBackground(bounds.centerX, bounds.centerY, 320, 50, false);
    this.cursorText.setVisible(false);
    
    // Restore placeholder if empty
    if (this.nicknameText.text === '') {
      this.nicknameText.setText('Click to enter nickname');
      this.nicknameText.setColor('#999999');
    }
  }

  private updateCursorPosition(): void {
    const textBounds = this.nicknameText.getBounds();
    this.cursorText.setPosition(textBounds.right + 2, textBounds.centerY);
  }

  private createStartButton(x: number, y: number): Phaser.GameObjects.Container {
    const theme = {
      buttonColor: '#4CAF50',
      buttonTextColor: '#ffffff',
    };

    // Button shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.5);
    shadow.fillRoundedRect(-150 + 3, -25 + 3, 300, 50, 12);

    // Button background with gradient
    this.startButtonBg = this.add.graphics();
    this.startButtonBg.fillStyle(parseInt(theme.buttonColor.replace('#', '0x'), 16), 1);
    this.startButtonBg.fillRoundedRect(-150, -25, 300, 50, 12);
    
    // Inner highlight
    this.startButtonBg.fillStyle(0xffffff, 0.15);
    this.startButtonBg.fillRoundedRect(-145, -20, 290, 15, 10);
    
    // Border
    this.startButtonBg.lineStyle(2, 0xffffff, 0.3);
    this.startButtonBg.strokeRoundedRect(-150, -25, 300, 50, 12);

    // Interactive area
    const hitArea = this.add.rectangle(0, 0, 300, 50, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });

    // Button text with shadow
    const labelShadow = this.add.text(1, 1, 'START GAME', {
      font: 'bold 20px Arial',
      color: '#000000',
    });
    labelShadow.setOrigin(0.5);
    labelShadow.setAlpha(0.5);

    this.startButtonLabel = this.add.text(0, 0, 'START GAME', {
      font: 'bold 20px Arial',
      color: theme.buttonTextColor,
    });
    this.startButtonLabel.setOrigin(0.5);

    // Container
    const button = this.add.container(x, y, [shadow, this.startButtonBg, hitArea, labelShadow, this.startButtonLabel]);
    button.setDepth(10);

    // Hover effects
    hitArea.on('pointerover', () => {
      if (this.isNicknameValid()) {
        this.tweens.add({
          targets: button,
          scale: 1.05,
          duration: 150,
          ease: 'Back.easeOut',
        });
      }
    });

    hitArea.on('pointerout', () => {
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
      });
    });

    hitArea.on('pointerdown', () => {
      if (this.isNicknameValid()) {
        this.tweens.add({
          targets: button,
          scale: 0.95,
          duration: 50,
          yoyo: true,
          onComplete: () => this.startGame(),
        });
      }
    });

    return button;
  }

  private isNicknameValid(): boolean {
    const nickname = this.nicknameText?.text || '';
    if (nickname === 'Click to enter nickname') return false;
    return nickname.trim().length >= 2 && nickname.length <= 20;
  }

  private updateStartButtonState(): void {
    const isValid = this.isNicknameValid();
    
    if (this.startButtonBg && this.startButtonLabel) {
      this.startButtonBg.clear();
      
      if (isValid) {
        // Active state - green
        this.startButtonBg.fillStyle(0x4CAF50, 1);
        this.startButtonBg.fillRoundedRect(-150, -25, 300, 50, 12);
        this.startButtonBg.fillStyle(0xffffff, 0.15);
        this.startButtonBg.fillRoundedRect(-145, -20, 290, 15, 10);
        this.startButtonBg.lineStyle(2, 0xffffff, 0.3);
        this.startButtonBg.strokeRoundedRect(-150, -25, 300, 50, 12);
        
        this.startButtonLabel.setAlpha(1);
      } else {
        // Disabled state - gray
        this.startButtonBg.fillStyle(0x666666, 1);
        this.startButtonBg.fillRoundedRect(-150, -25, 300, 50, 12);
        this.startButtonBg.fillStyle(0x000000, 0.3);
        this.startButtonBg.fillRoundedRect(-145, -20, 290, 15, 10);
        this.startButtonBg.lineStyle(2, 0x444444, 0.3);
        this.startButtonBg.strokeRoundedRect(-150, -25, 300, 50, 12);
        
        this.startButtonLabel.setAlpha(0.5);
      }
    }
  }

  private saveNickname(): void {
    const nickname = this.nicknameText.text === 'Click to enter nickname' ? '' : this.nicknameText.text.trim();
    
    if (nickname.length >= 2) {
      try {
        userManager.setNickname(nickname);
        console.log('✅ Nickname saved:', nickname);
      } catch (error) {
        console.error('❌ Failed to save nickname:', error);
        // Reset to previous value
        const saved = userManager.getNickname();
        this.nicknameText.setText(saved);
        this.nicknameText.setColor('#333333');
      }
    } else if (nickname.length > 0) {
      // Too short - reset to previous value
      const saved = userManager.hasProfile() ? userManager.getNickname() : '';
      this.nicknameText.setText(saved || 'Click to enter nickname');
      this.nicknameText.setColor(saved ? '#333333' : '#999999');
    }
    
    this.updateStartButtonState();
  }

  private openLevelEditor(): void {
    console.log('🎨 Opening level editor...');
    this.scene.start(SCENES.LEVEL_EDITOR);
  }
}

