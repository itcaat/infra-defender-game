# Deployment Guide

## GitHub Pages Deployment

This project includes automatic deployment to GitHub Pages via GitHub Actions.

### Setup Instructions

1. **Push to GitHub** (if not done already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

3. **Configure Base Path** (if needed):
   
   If your repository is at `https://github.com/username/repo-name`, your site will be at:
   - `https://username.github.io/repo-name/` (needs base path)
   
   Or if you're using a custom domain or it's a user/org page:
   - `https://username.github.io/` (no base path needed)

   **For repository pages (most common)**, update the workflow file:
   ```yaml
   # In .github/workflows/deploy.yml, add this to the Build step:
   - name: Build
     run: npm run build
     env:
       VITE_BASE_PATH: /repo-name/  # Replace with your actual repo name
   ```

4. **Trigger Deployment**:
   - Push to `main` branch, or
   - Go to **Actions** tab and click **Run workflow**

5. **Access Your Game**:
   - After deployment completes, visit your GitHub Pages URL
   - It will be shown in the deployment output

### Manual Build

To build locally:
```bash
npm run build
```

The built files will be in the `dist/` folder.

### Deploy to Other Platforms

#### Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`

#### Vercel
1. Import your GitHub repository
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

#### Cloudflare Pages
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Build output directory: `dist`

## Environment Variables

For production deployment with Supabase:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_BASE_PATH` - Base path for the app (e.g., `/infra-defender-game/`)

## Telegram Mini Apps

To deploy as a Telegram Mini App:
1. Deploy to any hosting (GitHub Pages, Netlify, etc.)
2. Get your deployment URL
3. Create a bot with [@BotFather](https://t.me/botfather)
4. Set the Mini App URL: `/newapp` → Enter your deployment URL
5. Configure bot settings and launch

## Notes

- The game runs entirely on the client side
- No server is required
- All game data is stored in browser localStorage
- Supabase is optional and runs in mock mode if not configured

