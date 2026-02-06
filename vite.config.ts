import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // OneDrive can lock files briefly while syncing, causing EBUSY on HMR.
        // These settings make the watcher more tolerant to partial writes/locks.
        watch: {
          usePolling: true,
          interval: 150,
          awaitWriteFinish: {
            stabilityThreshold: 800,
            pollInterval: 150,
          },
        },
      },
      plugins: [react()],
      // Spark Assistant removed: no API key defines needed
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
