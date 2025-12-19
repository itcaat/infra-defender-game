# Supabase Setup Guide

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Supabase Configuration
# Get these values from https://app.supabase.com/project/_/settings/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Development Mode
# Set to 'true' to use mock data instead of real Supabase (useful for offline development)
VITE_MOCK_SUPABASE=false
```

## Quick Start (Mock Mode)

The game works **without Supabase** in mock mode for local development:

1. Don't create a `.env` file (or set `VITE_MOCK_SUPABASE=true`)
2. Run `npm run dev`
3. Mock data will be used for profiles, sessions, and leaderboards

## Setting Up Real Supabase

### 1. Create Supabase Project

1. Go to https://app.supabase.com/
2. Create a new project
3. Wait for the project to be ready (~2 minutes)

### 2. Get API Credentials

1. Go to Project Settings → API
2. Copy the **Project URL** (e.g., `https://abcdefgh.supabase.co`)
3. Copy the **anon/public key**

### 3. Create Database Tables

Run these SQL queries in the Supabase SQL Editor:

```sql
-- Players/Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE,
  username TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_score INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  highest_level INTEGER DEFAULT 1,
  total_playtime INTEGER DEFAULT 0,
  achievements TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Game Sessions Table
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  level_id INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  waves_completed INTEGER DEFAULT 0,
  towers_placed INTEGER DEFAULT 0,
  enemies_defeated INTEGER DEFAULT 0,
  error_budget_remaining INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER DEFAULT 0,
  victory BOOLEAN DEFAULT FALSE,
  game_data JSONB
);

-- Leaderboard Table
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_username TEXT,
  score INTEGER NOT NULL,
  level_id INTEGER NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_profiles_telegram_id ON profiles(telegram_id);
CREATE INDEX idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX idx_leaderboard_level_id ON leaderboard(level_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for now - will be secured with Telegram auth later)
CREATE POLICY "Allow all for profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all for game_sessions" ON game_sessions FOR ALL USING (true);
CREATE POLICY "Allow all for leaderboard" ON leaderboard FOR ALL USING (true);
```

### 4. Configure Environment

Create `.env` file with your credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_MOCK_SUPABASE=false
```

### 5. Test Connection

Restart the dev server:

```bash
npm run dev
```

Check the browser console - you should see:
- ✅ "Supabase: Connected to real instance"
- ✅ "Supabase client initialized"

## Features

### Mock Mode (Default)
- ✅ Works offline
- ✅ No setup required
- ✅ Local mock data for profiles, sessions, leaderboards
- ✅ Perfect for development and testing game mechanics
- ⚠️ Data doesn't persist between page reloads

### Real Supabase Mode
- ✅ Persistent data storage
- ✅ Real leaderboards
- ✅ Player profiles synced across devices
- ✅ Game session history
- ✅ Ready for production deployment

## Telegram Authentication

For production, you'll need to:
1. Set up Supabase Edge Function to validate Telegram `initData`
2. Update RLS policies to check authenticated users
3. Implement secure score submission

This will be covered in Phase 8 of development.

## Troubleshooting

**Mock mode always active?**
- Check `.env` file exists and has correct values
- Restart dev server after creating/editing `.env`
- Check browser console for connection messages

**Connection errors?**
- Verify Supabase URL and anon key are correct
- Check Supabase project is running (not paused)
- Check browser console for error details

**Table errors?**
- Make sure all SQL queries ran successfully
- Check table names match exactly (lowercase)
- Verify RLS policies are created

