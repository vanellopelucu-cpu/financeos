import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
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
})
