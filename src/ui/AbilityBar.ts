/**
 * AbilityBar - UI for player abilities
 */

import Phaser from 'phaser';
import type { Ability, AbilityType } from '../systems/AbilitySystem';
import { telegram } from '../telegram/telegram';

export class AbilityBar extends Phaser.GameObjects.Container {
  private buttons: Map<AbilityType, Phaser.GameObjects.Container> = new Map();
  private cooldownTexts: Map<AbilityType, Phaser.GameObjects.Text> = new Map();
  private onAbilityClick: (type: AbilityType) => void;

  constructor(
    scene: Phaser.Scene,
    abilities: Ability[],
    onAbilityClick: (type: AbilityType) => void
  ) {
    super(scene, 0, 0);
    this.onAbilityClick = onAbilityClick;

    this.createBar(abilities);
    scene.add.existing(this);
  }

  private createBar(abilities: Ability[]): void {
    const startX = 20;
    const startY = this.scene.cameras.main.height / 2 - 50;
    const buttonSize = 70;
    const spacing = 10;

    this.setPosition(startX, startY);
    this.setDepth(100);

    // Create button for each ability
    abilities.forEach((ability, index) => {
      const y = (buttonSize + spacing) * index + spacing;
      const button = this.createAbilityButton(ability, 5, y, buttonSize);
      this.buttons.set(ability.type, button);
    });
  }

  private createAbilityButton(
    ability: Ability,
    x: number,
    y: number,
    size: number
  ): Phaser.GameObjects.Container {
    const theme = telegram.isTelegram() 
      ? telegram.getTheme()! 
      : telegram.getDefaultTheme();

    // Button shadow
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillRoundedRect(-size/2 + 2, -size/2 + 2, size, size, 10);
    
    // Button background with better styling
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0a0a0a, 1);
    bg.fillRoundedRect(-size/2, -size/2, size, size, 10);
    
    bg.fillStyle(0x2a2a2a, 0.9);
    bg.fillRoundedRect(-size/2 + 3, -size/2 + 3, size - 6, size - 6, 8);
    
    bg.lineStyle(2, parseInt(theme.buttonColor.replace('#', '0x'), 16), 0.6);
    bg.strokeRoundedRect(-size/2, -size/2, size, size, 10);
    
    // Interactive area
    const hitArea = this.scene.add.rectangle(0, 0, size, size, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });

    // Icon
    const icon = this.scene.add.text(0, -10, ability.icon, {
      font: '32px Arial',
    });
    icon.setOrigin(0.5);

    // Cost
    const cost = this.scene.add.text(0, 18, `💰${ability.cost}`, {
      font: 'bold 12px Arial',
      color: theme.textColor,
    });
    cost.setOrigin(0.5);

    // Cooldown overlay (initially hidden)
    const cooldownOverlay = this.scene.add.rectangle(0, 0, size, size, 0x000000, 0.7);
    cooldownOverlay.setVisible(false);

    const cooldownText = this.scene.add.text(0, 0, '', {
      font: 'bold 18px Arial',
      color: '#ffffff',
    });
    cooldownText.setOrigin(0.5);
    cooldownText.setVisible(false);
    this.cooldownTexts.set(ability.type, cooldownText);

    const button = this.scene.add.container(x, y, [shadow, bg, hitArea, icon, cost, cooldownOverlay, cooldownText]);
    this.add(button);

    // Hover effects
    hitArea.on('pointerover', () => {
      this.scene.tweens.add({
        targets: button,
        scale: 1.1,
        duration: 150,
        ease: 'Back.easeOut',
      });
      this.showTooltip(ability, x + size, y);
    });

    hitArea.on('pointerout', () => {
      this.scene.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
      });
      this.hideTooltip();
    });

    hitArea.on('pointerdown', () => {
      this.onAbilityClick(ability.type);
    });

    return button;
  }

  private showTooltip(_ability: Ability, _x: number, _y: number): void {
    // TODO: Implement tooltip
  }

  private hideTooltip(): void {
    // TODO: Implement tooltip
  }

  /**
   * Update cooldown display
   */
  updateCooldowns(cooldownsRemaining: Map<AbilityType, number>): void {
    cooldownsRemaining.forEach((remaining, type) => {
      const button = this.buttons.get(type);
      const cooldownText = this.cooldownTexts.get(type);
      
      if (!button || !cooldownText) return;

      const overlay = button.list[5] as Phaser.GameObjects.Rectangle;
      
      if (remaining > 0) {
        // Show cooldown
        overlay.setVisible(true);
        cooldownText.setVisible(true);
        cooldownText.setText(Math.ceil(remaining / 1000).toString());
      } else {
        // Hide cooldown
        overlay.setVisible(false);
        cooldownText.setVisible(false);
      }
    });
  }
}

