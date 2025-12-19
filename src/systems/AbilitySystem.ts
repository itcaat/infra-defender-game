/**
 * AbilitySystem - Manages player active abilities
 */

export type AbilityType = 'scale_up' | 'emergency_cache' | 'silence_alerts';

export interface Ability {
  type: AbilityType;
  name: string;
  description: string;
  icon: string;
  cooldown: number; // in milliseconds
  cost: number; // money cost
  duration?: number; // for abilities with duration
  lastUsed: number; // timestamp of last use
}

export class AbilitySystem {
  private abilities: Map<AbilityType, Ability>;

  constructor() {
    this.abilities = new Map();
    this.initializeAbilities();
  }

  private initializeAbilities(): void {
    this.abilities.set('scale_up', {
      type: 'scale_up',
      name: 'Scale Up',
      description: 'Double all tower attack speed for 10 seconds',
      icon: '⚡',
      cooldown: 30000, // 30 seconds
      cost: 150,
      duration: 10000, // 10 seconds
      lastUsed: -9999999,
    });

    this.abilities.set('emergency_cache', {
      type: 'emergency_cache',
      name: 'Emergency Cache',
      description: 'Slow all enemies by 50% for 8 seconds',
      icon: '🐌',
      cooldown: 25000, // 25 seconds
      cost: 100,
      duration: 8000, // 8 seconds
      lastUsed: -9999999,
    });

    this.abilities.set('silence_alerts', {
      type: 'silence_alerts',
      name: 'Silence Alerts',
      description: 'Instantly kill the weakest enemy',
      icon: '💀',
      cooldown: 20000, // 20 seconds
      cost: 120,
      lastUsed: -9999999,
    });
  }

  /**
   * Check if ability can be used
   */
  canUse(type: AbilityType, currentTime: number): boolean {
    const ability = this.abilities.get(type);
    if (!ability) return false;

    const timeSinceLastUse = currentTime - ability.lastUsed;
    return timeSinceLastUse >= ability.cooldown;
  }

  /**
   * Use ability
   */
  use(type: AbilityType, currentTime: number): boolean {
    const ability = this.abilities.get(type);
    if (!ability) return false;

    if (!this.canUse(type, currentTime)) {
      return false;
    }

    ability.lastUsed = currentTime;
    console.log(`✨ Used ability: ${ability.name}`);
    return true;
  }

  /**
   * Get ability info
   */
  getAbility(type: AbilityType): Ability | undefined {
    return this.abilities.get(type);
  }

  /**
   * Get all abilities
   */
  getAllAbilities(): Ability[] {
    return Array.from(this.abilities.values());
  }

  /**
   * Get cooldown remaining (in ms)
   */
  getCooldownRemaining(type: AbilityType, currentTime: number): number {
    const ability = this.abilities.get(type);
    if (!ability) return 0;

    const timeSinceLastUse = currentTime - ability.lastUsed;
    return Math.max(0, ability.cooldown - timeSinceLastUse);
  }
}

