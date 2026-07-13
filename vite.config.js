import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // GitHub Pages serves project sites below the repository name.
  base: command === 'build' ? '/wedding-invitation/' : '/',
  server: {
    proxy: {
      '/api/kath': {
        target: 'https://events.fitacademy.ph',
        changeOrigin: true,
        secure: true,
      },
    },
  },
}));
