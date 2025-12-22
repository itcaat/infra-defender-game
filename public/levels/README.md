# 📁 Levels Folder

## How to Add Levels

1. Export level from Level Editor (click "💾 Save")
2. Copy downloaded JSON file here
3. Rename to `level-N.json` (e.g., `level-1.json`, `level-2.json`)
4. Game will auto-load it!

## File Naming

- **Must** start with `level-`
- **Must** end with `.json`
- **Must** have a number: `level-1.json`, `level-2.json`, etc.

## Examples

✅ Good:
- `level-1.json`
- `level-2.json`
- `level-10.json`

❌ Bad:
- `mylevel.json`
- `level1.json` (missing hyphen)
- `level-a.json` (not a number)

## JSON Format

Your JSON should look like this:

```json
{
  "spawnPoints": [
    { "x": 0, "y": 2 }
  ],
  "targetPoints": [
    { "x": 10, "y": 5 }
  ],
  "paths": [
    [
      { "x": 0, "y": 2 },
      { "x": 1, "y": 2 },
      ...
    ]
  ]
}
```

## Current Levels

- `level-1.json` - Example level (replace with your own)

## Priority

Game loads levels in this order:
1. Test mode (from editor)
2. JSON files in this folder (level-1, level-2, etc.)
3. localStorage saved levels
4. Config file levels
5. Default level

## Tips

- Start with `level-1.json` - it loads by default
- Add more levels as `level-2.json`, `level-3.json`, etc.
- Keep backup copies of your levels!


