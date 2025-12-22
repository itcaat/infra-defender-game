# Project Structure

## Overview

Infra Defender - A tower defense game for DevOps/SRE community.

## Directory Structure

```
src/
├── config/           # Game configuration and constants
│   └── game.config.ts
├── entities/         # Game entities (Tower, Enemy, Projectile)
│   ├── Enemy.ts
│   └── Tower.ts
├── game/             # Game logic and state management
│   └── GameManager.ts
├── scenes/           # Phaser game scenes
│   ├── BootScene.ts
│   ├── PreloadScene.ts
│   ├── MainMenuScene.ts
│   ├── GameScene.ts
│   ├── UIScene.ts
│   ├── PauseScene.ts
│   ├── GameOverScene.ts
│   └── VictoryScene.ts
├── supabase/         # Database integration
│   ├── client.ts
│   └── config.ts
├── telegram/         # Telegram Mini Apps integration
│   └── telegram.ts
├── types/            # TypeScript type definitions
│   ├── game.types.ts
│   └── phaser.types.ts
└── main.ts           # Application entry point
```

## Architecture

### Scene Flow

```
BootScene → PreloadScene → MainMenuScene → GameScene (+ UIScene)
                                                ↓
                                         PauseScene
                                                ↓
                                    GameOverScene / VictoryScene
```

### State Management

- **GameManager**: Singleton class managing global game state
  - Money, Error Budget, Score, Wave tracking
  - Event-driven communication between scenes
  - Game flow control (pause, game over, victory)

### Entity System

- **Tower**: Base class for all defensive structures
  - 6 tower types (Nginx, Load Balancer, Redis, Kafka, Database, Monitoring)
  - Attack system with cooldowns
  - Upgrade mechanics
  - Range visualization

- **Enemy**: Base class for all incidents
  - 5 enemy types (Traffic Spike, DDoS, Memory Leak, Slow Query, Friday Deploy)
  - Pathfinding along grid
  - Health system with visual health bars
  - Different behaviors and rewards

### Integration Layers

- **Telegram**: User authentication, theme adaptation, native UI
- **Supabase**: Player profiles, game sessions, leaderboards
  - Mock mode for offline development
  - Real mode for production

## Key Files

- `src/main.ts` - Application initialization
- `src/config/game.config.ts` - All game constants
- `src/game/GameManager.ts` - Central state management
- `src/scenes/GameScene.ts` - Main gameplay logic
- `src/scenes/UIScene.ts` - HUD and UI elements

## Development Workflow

1. **Local Development**: Uses mock mode (no Supabase/Telegram required)
2. **Assets**: Placeholder graphics (colored rectangles) used for MVP
3. **Grid System**: 64px cells, 20x11 grid (1280x720)
4. **Debug Mode**: Set `DEBUG_MODE: true` in game.config.ts

## Next Steps

See `.cursor/scratchpad.md` for detailed development roadmap.

**Current Phase**: Phase 1 ✅ Complete
**Next Phase**: Phase 2 - Core Game Mechanics


