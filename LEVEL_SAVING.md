# 💾 Automatic Level Saving & Loading

## How It Works Now

### ✨ New Features:

1. **Auto-Save to Browser** - Levels saved in localStorage
2. **Auto-Load on Start** - Game automatically loads your saved levels
3. **Download JSON Files** - Backup files downloaded automatically
4. **Load Menu** - Browse and switch between saved levels

---

## 🎮 Workflow

### 1. Create & Save Level

1. Open Level Editor (dev mode)
2. Draw your level
3. Click **"💾 Save"** button

**What happens:**
- ✅ Level saved to browser localStorage
- ✅ JSON file downloaded to your computer
- ✅ Assigned next available level number
- ✅ Ready to play immediately!

### 2. Play Your Level

Just start the game normally:
- Game **automatically loads** first saved level
- No manual importing needed!
- Works across browser restarts

### 3. Load Different Level

In Level Editor:
1. Click **"📂 Load"** button
2. Select from your saved levels
3. Edit or test as needed

---

## 💾 Storage Details

### Where Levels Are Stored:

1. **Browser localStorage** (automatic, persistent)
   - Key: `savedCustomLevels`
   - Survives browser restarts
   - Cleared only if you clear browser data

2. **Downloaded JSON files** (backup)
   - Format: `level-{id}-{timestamp}.json`
   - Saved to your Downloads folder
   - Can be shared or backed up

### Storage Format:

```json
{
  "1": {
    "spawnPoints": [...],
    "targetPoints": [...],
    "paths": [[...]]
  },
  "2": {
    "spawnPoints": [...],
    "targetPoints": [...],
    "paths": [[...]]
  }
}
```

---

## 🔄 Loading Priority

Game loads levels in this order:

1. **Test mode** (from editor "Test" button)
2. **Saved levels** (from localStorage)
3. **Config levels** (from `levels.config.ts`)
4. **Default level** (built-in)

---

## 🛠️ Managing Levels

### View Saved Levels

```javascript
// Open browser console (F12)
JSON.parse(localStorage.getItem('savedCustomLevels'))
```

### Delete All Saved Levels

```javascript
// Open browser console (F12)
localStorage.removeItem('savedCustomLevels')
```

### Delete Specific Level

Use the Level Editor Load menu and edit localStorage directly.

### Import Downloaded JSON

Currently manual - paste into `src/config/levels.config.ts`  
*(Auto-import UI coming in future update)*

---

## 📁 Buttons Explained

### Level Editor:

- **📂 Load** - Browse and load saved levels
- **🗑️ Clear** - Clear current editor (doesn't delete saved)
- **💾 Save** - Save to localStorage + download JSON
- **🎮 Test** - Test in game (temporary)
- **🔙 Back** - Return to menu

---

## 🎯 Tips

1. **Save Often** - Click Save after major changes
2. **Backup JSONs** - Keep downloaded files safe
3. **Test First** - Always test before considering level "done"
4. **Multiple Levels** - Create multiple levels, switch between them
5. **Browser Data** - Don't clear browser data or you'll lose saved levels

---

## 🔧 Advanced: Manual Level Management

### Add Level from JSON File:

1. Open the downloaded JSON file
2. Copy contents
3. Open browser console (F12)
4. Run:
```javascript
const savedLevels = JSON.parse(localStorage.getItem('savedCustomLevels') || '{}');
savedLevels[99] = YOUR_PASTED_JSON; // Use any number
localStorage.setItem('savedCustomLevels', JSON.stringify(savedLevels));
```

### Export All Levels:

```javascript
// Copy this output
console.log(localStorage.getItem('savedCustomLevels'));
```

---

## ❓ FAQ

**Q: Where did my level go?**  
A: Check if browser data was cleared. Use downloaded JSON backup to restore.

**Q: Can I share my level?**  
A: Yes! Send the downloaded JSON file. Recipient can paste into config or import via console.

**Q: How many levels can I save?**  
A: localStorage limit is ~5-10MB. Plenty for hundreds of levels!

**Q: Does this work offline?**  
A: Yes! localStorage works offline.

**Q: What if I want to use config file instead?**  
A: Just copy JSON to `levels.config.ts` - it still works!

---

## 🚀 Future Enhancements

- [ ] Import JSON via UI
- [ ] Level metadata (name, description, difficulty)
- [ ] Level thumbnails/previews
- [ ] Cloud sync (Supabase)
- [ ] Share levels with community
- [ ] Level collections/campaigns

