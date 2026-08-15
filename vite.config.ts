import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'fs'

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

function loadEnvSimple() {
  try {
    const content = readFileSync(new URL('./.env', import.meta.url), 'utf-8')
    const env: Record<string, string> = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=')
        if (idx > 0) {
          const key = trimmed.substring(0, idx).trim()
          const val = trimmed.substring(idx + 1).trim()
          env[key] = val
        }
      }
    }
    return env
  } catch {
    return {}
  }
}

export default defineConfig(() => {
  const env = loadEnvSimple()
  const serviceKey = env.SUPABASE_SERVICE_KEY || ''

  return {
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __SUPABASE_SERVICE_KEY__: JSON.stringify(serviceKey),
  },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      devOptions: {
        enabled: false,
      },
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*.png'],
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'scripts-styles',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.hostname.includes('supabase.co') ||
              url.hostname.includes('supabase.com'),
            handler: 'NetworkOnly',
            options: {
              cacheName: 'supabase-api',
            },
          },
        ],
      },
      includeManifestIcons: true,
      manifest: {
        name: 'FinanceOS',
        short_name: 'FinanceOS',
        description: 'Personal Finance Manager',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#8B5CF6',
        background_color: '#FAF8FF',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  }
})
