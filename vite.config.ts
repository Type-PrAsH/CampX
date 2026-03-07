import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    define: {
      'process.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY),
    },
  };
});
