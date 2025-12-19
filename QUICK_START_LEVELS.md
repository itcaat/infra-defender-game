# 🚀 Quick Start: Adding Your Level

## TL;DR (New Way - Automatic!)

1. **Open Level Editor** (dev mode)
2. **Draw your level**
3. **Click "💾 Save"**
4. **Done!** Level auto-loads next time you play

No code editing needed! 🎉

---

## Old Way (Manual - Still Works)

1. **Export from editor** → Copy JSON
2. **Open** `src/config/levels.config.ts`
3. **Paste** into `CUSTOM_LEVELS`
4. **Done!** Level will load automatically

---

## Step 1: Export Level

In Level Editor, click **"💾 Export"**

You'll get JSON like this:
```json
{
  "spawnPoints": [{"x": 0, "y": 2}],
  "targetPoints": [{"x": 10, "y": 5}],
  "paths": [[
    {"x": 0, "y": 2},
    {"x": 1, "y": 2},
    ...
  ]]
}
```

## Step 2: Add to Config

Open: `src/config/levels.config.ts`

```typescript
export const CUSTOM_LEVELS = {
  1: {
    // 👇 PASTE HERE
    spawnPoints: [{"x": 0, "y": 2}],
    targetPoints: [{"x": 10, "y": 5}],
    paths: [[
      {"x": 0, "y": 2},
      {"x": 1, "y": 2},
      // ... rest of path
    ]]
  }
};
```

## Step 3: Select Level (Optional)

In `src/scenes/GameScene.ts`, line ~60:

```typescript
const selectedLevel = 1; // 👈 Change this number
```

That's it! 🎉

---

## Adding Multiple Levels

```typescript
export const CUSTOM_LEVELS = {
  1: {
    // First level
    spawnPoints: [...],
    paths: [...]
  },
  2: {
    // Second level
    spawnPoints: [...],
    paths: [...]
  },
  3: {
    // Third level
    spawnPoints: [...],
    paths: [...]
  }
};
```

Then change `selectedLevel` to pick which one loads.

---

## Pro Tip

Remove `gridWidth` and `gridHeight` from the JSON when pasting - they're not needed in the config.

**Before:**
```json
{
  "spawnPoints": [...],
  "targetPoints": [...],
  "paths": [...],
  "gridWidth": 20,    // ❌ Remove these
  "gridHeight": 11    // ❌ Remove these
}
```

**After:**
```typescript
{
  spawnPoints: [...],
  targetPoints: [...],
  paths: [...]
}
```

