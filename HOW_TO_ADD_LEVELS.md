# 🎮 How to Add Levels - Simple Way

## TL;DR

1. **Export** from Level Editor (click "💾 Save")
2. **Copy** downloaded JSON file to `public/levels/`
3. **Rename** to `level-1.json`
4. **Done!** Game auto-loads it

---

## Step-by-Step

### 1️⃣ Create Level

1. Open game in dev mode
2. Click "🎨 LEVEL EDITOR" in main menu
3. Draw your level (paths, spawn points, targets)
4. Click "💾 Save"
5. A file like `level-1-1234567890.json` downloads

### 2️⃣ Add to Game

1. Find the downloaded JSON file (usually in Downloads)
2. **Copy** it to: `public/levels/`
3. **Rename** to: `level-1.json`

That's it! 🎉

### 3️⃣ Test

1. Restart the game
2. Start playing
3. Your level loads automatically!

---

## 📁 Folder Structure

```
infra-defender-game/
├── public/
│   └── levels/
│       ├── level-1.json  👈 Your level goes here
│       ├── level-2.json  (optional)
│       └── level-3.json  (optional)
└── src/
```

---

## 📝 File Naming Rules

✅ **Correct:**
- `level-1.json`
- `level-2.json`
- `level-10.json`

❌ **Wrong:**
- `mylevel.json` (missing "level-" prefix)
- `level1.json` (missing hyphen)
- `level-a.json` (must be a number)

---

## 🔢 Multiple Levels

Want multiple levels?

1. Name them: `level-1.json`, `level-2.json`, etc.
2. Game loads `level-1.json` by default
3. To switch, change level number in code (see Advanced)

---

## 🎯 What the JSON Should Look Like

Your downloaded file will already be correct, but it looks like this:

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
      { "x": 2, "y": 2 }
    ]
  ]
}
```

**Just copy the whole file - don't edit anything!**

---

## 🔄 Loading Priority

Game tries to load levels in this order:

1. **Test mode** (from editor "Test" button)
2. **JSON file** (`public/levels/level-1.json`) ⭐ **This is what you want**
3. **localStorage** (browser storage)
4. **Config file** (`src/config/levels.config.ts`)
5. **Default level** (built-in example)

---

## 💡 Pro Tips

1. **Backup your levels** - Copy JSON files somewhere safe
2. **Version control** - Commit `public/levels/` to git
3. **Test first** - Always test in editor before saving
4. **Keep originals** - Don't delete downloaded files

---

## ❓ Common Issues

**"My level doesn't load!"**
- Check file is named exactly `level-1.json`
- Check file is in `public/levels/` folder
- Check JSON is valid (no syntax errors)
- Restart dev server: `npm run dev`

**"Game loads default level"**
- Your file might not be named correctly
- File might not be in the right folder
- Check browser console (F12) for errors

**"JSON is invalid"**
- Don't edit the downloaded file
- Make sure you copied the whole file
- Check for extra commas or brackets

---

## 🚀 Quick Example

```bash
# 1. Your file downloads as:
Downloads/level-1-1702995123.json

# 2. Copy and rename:
cp ~/Downloads/level-1-1702995123.json public/levels/level-1.json

# 3. Restart game
npm run dev

# Done! 🎉
```

---

## 🔧 Advanced: Switch Levels

To load `level-2.json` instead of `level-1.json`:

Edit `src/scenes/GameScene.ts`, line ~70:

```typescript
const levelFromFile = await this.loadLevelFromFile(2); // Change 1 to 2
```

Or create a level select menu (coming soon!).

---

## 📚 More Help

- `public/levels/README.md` - Folder documentation
- `LEVEL_EDITOR.md` - Editor guide
- `LEVEL_SAVING.md` - Storage details

Need help? Check the console (F12) for error messages!


