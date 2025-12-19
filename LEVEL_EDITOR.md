# 🎨 Level Editor Guide

## Accessing the Level Editor

The Level Editor is available in **development mode only**.

### How to access:
1. Run the game in dev mode: `npm run dev`
2. In the main menu, click the **"🎨 LEVEL EDITOR"** button at the bottom

OR add `?dev` to the URL: `http://localhost:5173/?dev`

## Using the Editor

### Modes

The editor has 4 modes:

1. **🟢 Spawn Mode** - Click cells to place enemy spawn points
   - These are where enemies will start their journey
   - You can place multiple spawn points
   - Marked with green "S" on the grid

2. **🔴 Target Mode** - Click cells to place target points
   - These are where enemies try to reach (datacenter)
   - Usually one target point per level
   - Marked with red "T" on the grid

3. **🟡 Path Mode** - Draw paths by clicking and dragging
   - Paths must be adjacent cells (no diagonal)
   - Each path connects a spawn to a target
   - Hold mouse and drag to draw a continuous path
   - Release mouse to finish the current path
   - You can draw multiple separate paths
   - Marked with yellow/orange on the grid

4. **❌ Erase Mode** - Click to remove spawn points, targets, or paths
   - Removes any element at the clicked cell
   - If a cell is part of a path, the entire path is removed

### Action Buttons

- **🗑️ Clear** - Remove all spawn points, targets, and paths (start fresh)
- **💾 Export** - Export the level data as JSON
  - Copies to clipboard (if available)
  - Saves to console
  - Saves to localStorage for later editing
  
- **🎮 Test** - Test your level in the game
  - Validates that you have at least one spawn, target, and path
  - Loads your level into the game for testing
  - Uses 3 preset waves for testing
  
- **🔙 Back** - Return to main menu
  - Your level is automatically saved to localStorage

## Level Data Format

The exported level data looks like this:

```json
{
  "spawnPoints": [
    { "x": 0, "y": 2 },
    { "x": 19, "y": 2 }
  ],
  "targetPoints": [
    { "x": 10, "y": 5 }
  ],
  "paths": [
    [
      { "x": 0, "y": 2 },
      { "x": 1, "y": 2 },
      { "x": 2, "y": 2 },
      // ... more path cells
      { "x": 10, "y": 5 }
    ]
  ],
  "gridWidth": 20,
  "gridHeight": 11
}
```

## Tips

1. **Plan your paths** - Make sure paths are not too short (too hard) or too long (too easy)
2. **Multiple spawn points** - Creates more interesting gameplay with enemies coming from different directions
3. **Path complexity** - Winding paths give players more time to place towers
4. **Test early and often** - Use the Test button frequently to validate your level design
5. **Grid size** - The grid is 20x11 (width x height) by default

## Workflow

1. Place spawn points where enemies should appear
2. Place target points (datacenter locations)
3. Draw paths connecting spawns to targets
4. Test the level
5. Adjust as needed
6. Export the final level data

## Integration

To use your level in the actual game:

1. Export the level data
2. Copy the JSON
3. Replace or add to the level data in `src/scenes/GameScene.ts`
4. The level will be available in the game

## Keyboard Shortcuts

Currently none, but could be added:
- `S` - Spawn mode
- `T` - Target mode  
- `P` - Path mode
- `E` - Erase mode
- `Ctrl+Z` - Undo (future)

## Known Limitations

- No undo/redo yet
- Can't edit individual path cells (must redraw entire path)
- No wave editor (waves are preset in test mode)
- No visual path direction indicators while drawing

## Future Enhancements

- [ ] Undo/redo functionality
- [ ] Path editing (insert/remove individual cells)
- [ ] Wave configuration UI
- [ ] Multiple level slots
- [ ] Import level from JSON
- [ ] Preview mode (see level without UI)
- [ ] Grid cell tooltips showing coordinates
- [ ] Keyboard shortcuts
- [ ] Copy/paste level sections

