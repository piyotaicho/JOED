import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'depmodules': fileURLToPath(new URL(
        process.env.VITE_APP_ELECTION
          ? './src/modules/electron'
          : './src/modules/serve',
        import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      input: '/src/main.js'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
