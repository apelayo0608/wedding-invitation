import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // Relative assets work on both the repository URL and the custom domain.
  base: command === 'build' ? './' : '/',
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
