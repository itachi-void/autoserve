import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Vite configuration — AutoServe Workshop Cloud OS
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyUrl = process.env.FIXSYS_API_PROXY_URL || env.FIXSYS_API_PROXY_URL || 'http://127.0.0.1:5099'
  const isDev = mode === 'development'

  return {
    base: '/',
    build: {
      sourcemap: isDev ? 'inline' : false,
      minify: !isDev,
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'lucide-react',
      ],
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
      strictPort: true,
      proxy: {
        '/graphql': { target: apiProxyUrl, changeOrigin: true },
        '/api-health': { target: apiProxyUrl, changeOrigin: true, rewrite: () => '/health' },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
    },
  }
})
