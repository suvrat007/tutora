import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["tutora-logo.png", "models/**/*"],
      manifest: {
        name: "Tutora",
        short_name: "Tutora",
        description: "Coaching management platform",
        theme_color: "#f8ede3",
        background_color: "#f8ede3",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/login",
        icons: [
          {
            src: "/tutora-logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/tutora-logo.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/tutora-logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/api\/v1\/.*/i,
            handler: "NetworkFirst",
            method: "GET",
            options: {
              cacheName: "api-get-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/api\/v1\/.*/i,
            handler: "NetworkOnly",
            method: "POST",
            options: {
              backgroundSync: {
                name: "api-post-queue",
                options: { maxRetentionTime: 24 * 60 },
              },
            },
          },
          {
            urlPattern: /\/api\/v1\/.*/i,
            handler: "NetworkOnly",
            method: "PUT",
            options: {
              backgroundSync: {
                name: "api-put-queue",
                options: { maxRetentionTime: 24 * 60 },
              },
            },
          },
          {
            urlPattern: /\/api\/v1\/.*/i,
            handler: "NetworkOnly",
            method: "PATCH",
            options: {
              backgroundSync: {
                name: "api-patch-queue",
                options: { maxRetentionTime: 24 * 60 },
              },
            },
          },
          {
            urlPattern: /\/api\/v1\/.*/i,
            handler: "NetworkOnly",
            method: "DELETE",
            options: {
              backgroundSync: {
                name: "api-delete-queue",
                options: { maxRetentionTime: 24 * 60 },
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
  },
})
