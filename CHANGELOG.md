# Changelog

## [Latest] - Nickname System Update

### Added
- **Beautiful Nickname Panel** in main menu
  - Dedicated panel with rounded corners and green border
  - Glowing effect on focus
  - Better visual hierarchy with "👤 Your Nickname:" label
  
- **Nickname Validation**
  - START GAME button is disabled (gray) when nickname is empty or invalid
  - Button turns green and becomes clickable when nickname is valid (2-20 characters)
  - Visual feedback: input field shakes and turns red if you try to start without a valid nickname
  
- **Real-time Updates**
  - Button state updates as you type
  - Smooth transitions between enabled/disabled states
  - Input validation happens on every keystroke
  
- **User Hints**
  - Clear hint below input: "2-20 characters required to start"
  - Placeholder text: "Enter your nickname"
  - Focus/blur visual feedback with border color changes

### Changed
- Removed separate NicknameScene - now everything is in the main menu
- Removed "Change Nickname" button - nickname is always editable
- Settings button removed from main menu
- Improved input field styling with better borders and transitions

### Technical Details
- Nickname stored in localStorage via UserManager
- Validation: 2-20 characters
- Auto-save on blur or Enter key
- Start button dynamically enabled/disabled based on nickname validity

### UI Improvements
- Nickname panel: 400x90px with dark background and green border
- Input field: 360x45px with smooth transitions
- Focus effect: Glowing green border with box-shadow
- Disabled button: Gray color (#666666) with reduced opacity
- Active button: Green color (#4CAF50) with full opacity


