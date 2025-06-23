import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Import the 'path' module

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: { // ADD THIS BLOCK
    alias: {
      // Define an alias for 'temp-components'
      '@temp': path.resolve(__dirname, './temp-components'),
      // If you ever use '@src', you could add it like:
      // '@src': path.resolve(__dirname, './src'),
    },
  },
});