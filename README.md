# 🛡️ Infra Defender

A pixel-art tower defense game for the DevOps/SRE community, built for Telegram Mini Apps.

## 🎮 About

Defend your infrastructure from incidents! Place DevOps components (Nginx, Load Balancer, Redis, Kafka, Database) strategically to protect your services from attacks like Traffic Spikes, DDoS, Memory Leaks, Slow Queries, and the dreaded Friday Deploy.

## 🚀 Tech Stack

- **Frontend**: Vite + TypeScript + Phaser 3
- **Platform**: Telegram Mini Apps
- **Backend**: Supabase (leaderboards, storage, authentication)
- **Blockchain**: TON (optional monetization)

## 📦 Development Setup

### Prerequisites

- Node.js 18+ and npm
- Modern web browser
- (Optional) Telegram account for testing Mini Apps integration

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server

After running `npm run dev`, the game will be available at:
- **Local**: http://localhost:3000/
- **Test Page**: Open `telegram-test.html` in browser for integrated testing

### Testing Telegram Integration

**Local Testing:**
1. Run `npm run dev`
2. Open `telegram-test.html` in your browser
3. Game will detect browser environment and use default theme

**Telegram Testing:**
1. Deploy app to public URL (Vercel, GitHub Pages, etc.)
2. Create bot via [@BotFather](https://t.me/BotFather)
3. Set Mini App URL in bot settings
4. Open Mini App from Telegram
5. Game will detect Telegram environment and:
   - Show user's name
   - Apply Telegram theme
   - Enable native Telegram UI (alerts, confirms)
   - Provide `initData` for backend authentication

## 🎯 Project Status

**Phase 1: Project Setup & Foundation** ✅ COMPLETE

### Completed
- ✅ Project initialization (Vite + TypeScript + Phaser 3)
- ✅ Development environment setup
- ✅ Telegram Mini Apps SDK integration
- ✅ Supabase client setup (with mock mode)
- ✅ Complete Phaser 3 scene architecture (8 scenes)
- ✅ Game state management (GameManager)
- ✅ Base entity classes (Tower, Enemy)
- ✅ Configuration and type systems

### Next Up: Phase 2
- 🔄 Tower placement and selection
- 🔄 Enemy spawning and pathfinding
- 🔄 Wave management system
- 🔄 Combat mechanics (towers attacking enemies)

## 📝 Documentation

- **Game Design**: See `.cursor/scratchpad.md` for detailed GDD and development roadmap
- **Supabase Setup**: See `SUPABASE_SETUP.md` for database configuration
- **Telegram Testing**: Open `telegram-test.html` for local testing environment

## 🤝 Contributing

This project is in active development. Contributions welcome!

## 📄 License

MIT License

---

**Status**: 🚧 In Development | Made with 💚 for the DevOps community

