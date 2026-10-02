import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /<repo>/, so the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Fundi – Trusted local services',
        short_name: 'Fundi',
        description: 'Find trusted plumbers, electricians and more across South Africa. Compare prices and ratings.',
        lang: 'en-ZA',
        theme_color: '#0d4a3a',
        background_color: '#f3f6f4',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['lifestyle', 'utilities', 'business'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Need help now', url: 'emergency', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Check a quote', url: 'check', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
})
