import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // Dev server proxy — forwards /api/* to the backend so no CORS issues in dev
    // and no need for a hardcoded backend URL in dev code.
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },

    // Production build goes to dist/ (will be mounted by FastAPI as static files)
    build: {
      outDir: 'dist',
      sourcemap: false,           // no source maps in prod
      chunkSizeWarningLimit: 2000, // Three.js chunks are large
      rollupOptions: {
        output: {
          // Split vendor chunks for better caching
          manualChunks: {
            'three': ['three'],
            'react': ['react', 'react-dom'],
            'fiber': ['@react-three/fiber', '@react-three/drei'],
          },
        },
      },
    },
  }
})
