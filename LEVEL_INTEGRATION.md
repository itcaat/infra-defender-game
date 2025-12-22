# 🎮 How to Add Custom Levels from Editor

## Step-by-Step Guide

### 1. Create Level in Editor

1. Open Level Editor (dev mode)
2. Draw your level (paths, spawn points, targets)
3. Click **"💾 Export"** button
4. Copy the JSON from console or clipboard

### 2. Add Level to Game

Open `src/config/levels.config.ts` and add your level:

```typescript
export const CUSTOM_LEVELS: Record<number, ...> = {
  1: {
    // Paste your exported JSON here
    spawnPoints: [{ x: 0, y: 2 }, { x: 19, y: 2 }],
    targetPoints: [{ x: 10, y: 5 }],
    paths: [
      [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        // ... rest of your path
      ]
    ]
  },
  
  2: {
    // Add another level
    spawnPoints: [...],
    targetPoints: [...],
    paths: [...]
  },
};
```

### 3. Use Level in Game

#### Option A: Replace default level

Open `src/scenes/GameScene.ts` and modify the `create()` method:

```typescript
// Instead of:
this.level = this.createMockLevel();

// Use:
if (CUSTOM_LEVELS[1]) {
  this.level = createLevelFromConfig(1, CUSTOM_LEVELS[1]);
} else {
  this.level = this.createMockLevel();
}
```

#### Option B: Level selection system

You can create a level selection menu:

```typescript
// In MainMenuScene or new LevelSelectScene
private selectLevel(levelId: number): void {
  // Store selected level
  localStorage.setItem('selectedLevel', levelId.toString());
  
  // Start game
  this.scene.start(SCENES.GAME);
  this.scene.launch(SCENES.UI);
}

// In GameScene.create()
const selectedLevel = localStorage.getItem('selectedLevel');
if (selectedLevel && CUSTOM_LEVELS[Number(selectedLevel)]) {
  this.level = createLevelFromConfig(
    Number(selectedLevel), 
    CUSTOM_LEVELS[Number(selectedLevel)]
  );
} else {
  this.level = this.createMockLevel();
}
```

## Example: Full Integration

### 1. Export from editor:

```json
{
  "spawnPoints": [
    { "x": 0, "y": 1 },
    { "x": 19, "y": 1 }
  ],
  "targetPoints": [
    { "x": 10, "y: 5 }
  ],
  "paths": [
    [
      { "x": 0, "y": 1 },
      { "x": 1, "y": 1 },
      { "x": 2, "y": 1 },
      { "x": 3, "y": 1 },
      { "x": 4, "y": 1 },
      { "x": 4, "y": 2 },
      { "x": 4, "y": 3 },
      { "x": 4, "y": 4 },
      { "x": 4, "y": 5 },
      { "x": 5, "y": 5 },
      { "x": 6, "y": 5 },
      { "x": 7, "y": 5 },
      { "x": 8, "y": 5 },
      { "x": 9, "y": 5 },
      { "x": 10, "y": 5 }
    ]
  ],
  "gridWidth": 20,
  "gridHeight": 11
}
```

### 2. Add to `levels.config.ts`:

```typescript
export const CUSTOM_LEVELS = {
  1: {
    spawnPoints: [
      { x: 0, y: 1 },
      { x: 19, y: 1 }
    ],
    targetPoints: [
      { x: 10, y: 5 }
    ],
    paths: [
      [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        // ... paste rest
      ]
    ]
  }
};
```

### 3. Use in game:

The level will be automatically loaded with proper waves and configuration!

## Customizing Waves

You can customize the waves for each level by modifying the `createLevelFromConfig` function:

```typescript
export function createLevelFromConfig(
  levelId: number,
  config: typeof CUSTOM_LEVELS[number]
): LevelData {
  // Different waves based on level
  const wavesByLevel = {
    1: [...easyWaves],
    2: [...mediumWaves],
    3: [...hardWaves],
  };
  
  return {
    // ...
    waves: wavesByLevel[levelId] || defaultWaves,
    // ...
  };
}
```

## File Locations

- **Level definitions**: `src/config/levels.config.ts`
- **Load levels**: `src/scenes/GameScene.ts` (in `create()` method)
- **Level editor**: Access via main menu in dev mode

## Tips

1. **Test first**: Always test your level in the editor before adding to config
2. **Multiple paths**: More paths = more challenge
3. **Path length**: Longer paths give players more time to build
4. **Waves**: Adjust wave difficulty based on path complexity
5. **Starting money**: Longer/harder levels might need more starting money

## Future Enhancements

- [ ] Dynamic level loading from JSON files
- [ ] Level progression system
- [ ] Difficulty ratings
- [ ] Level metadata (author, description, etc.)
- [ ] Community level sharing


