import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' 
    ? '/infra-defender-game/' 
    : '/',
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  }
})
