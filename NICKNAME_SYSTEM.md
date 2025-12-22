# Nickname System

## Overview

The game now uses a simple nickname-based user system instead of Telegram integration. Users enter their nickname once, and it's stored in localStorage for future sessions.

## Features

- **Inline Nickname Input**: Nickname field is directly in the main menu
- **Persistent Storage**: Nicknames are saved in localStorage and persist across sessions
- **Validation**: Nicknames must be 2-20 characters long
- **Auto-save**: Nickname is automatically saved when you click away or press Enter
- **Always Editable**: You can change your nickname anytime from the main menu

## Implementation

### Key Files

1. **`src/utils/UserManager.ts`**
   - Singleton class managing user profiles
   - Handles nickname storage in localStorage
   - Provides validation and retrieval methods

2. **`src/scenes/MainMenuScene.ts`**
   - Includes inline nickname input field
   - HTML input field with auto-save on blur
   - Styled to match the game's theme
   - Pre-filled with current nickname if exists

3. **Modified Scenes**
   - All scenes now use a default theme instead of Telegram theme
   - Removed Telegram SDK and Supabase dependencies from UI components
   - Score saving is disabled (no backend integration)

### User Flow

1. **Every Launch**:
   - BootScene → PreloadScene → MainMenuScene
   - MainMenuScene shows nickname input field (pre-filled if exists)
   - User can edit nickname anytime, it saves automatically on blur/Enter

2. **Main Menu**:
   - Nickname input field is always visible and editable
   - No separate screens needed for nickname management
   - Settings button has been removed

## API

### UserManager

```typescript
import { userManager } from './utils/UserManager';

// Check if user has a profile
userManager.hasProfile(); // boolean

// Get user nickname
userManager.getNickname(); // string (or 'Guest')

// Set nickname (with validation)
userManager.setNickname('PlayerName'); // throws Error if invalid

// Clear profile
userManager.clearProfile();
```

## Theme

The game now uses a consistent green theme:

```typescript
{
  bgColor: '#1a1a1a',
  textColor: '#ffffff',
  hintColor: '#aaaaaa',
  linkColor: '#4CAF50',
  buttonColor: '#4CAF50',
  buttonTextColor: '#ffffff',
  secondaryBgColor: '#2a2a2a',
}
```

## Removed Dependencies

- Telegram Mini Apps SDK (`@tma.js/sdk`)
- Supabase integration for user profiles and leaderboards
- All Telegram-specific UI theming

## Future Enhancements

If you want to add backend features:

1. Replace localStorage with API calls in `UserManager`
2. Implement proper authentication
3. Re-enable score saving in `GameOverScene` and `VictoryScene`
4. Add leaderboard functionality

