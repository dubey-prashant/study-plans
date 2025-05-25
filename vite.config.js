import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    // allowedHosts: ['aaa6-150-242-197-234.ngrok-free.app'], // Add your Ngrok domain here
  },
});
