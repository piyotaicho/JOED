import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { version, description } from './package.json'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 環境変数を読み込み
  const env = loadEnv(mode, process.cwd(), '')
  const isElectron = env.VITE_APP_ELECTRON !== undefined

  if (isElectron) {
    console.log('Building bundles for Electron environment.')
  }

  return {
    base: './',
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'depmodules': fileURLToPath(new URL(
          isElectron
            ? './src/modules/electron'
            : './src/modules/serve',
          import.meta.url)),
        ...isElectron
          ? {}
          : {
            util: 'util/',
            events: 'events/',
            process: 'process/browser',
            './customUtils.js': fileURLToPath(
              new URL(
                './node_modules/@seald-io/nedb/browser-version/lib/customUtils.js',
                import.meta.url
              )
            ),
            './storage.js': fileURLToPath(
              new URL(
                './node_modules/@seald-io/nedb/browser-version/lib/storage.browser.js',
                import.meta.url
              )
            ),
            './byline': fileURLToPath(
              new URL(
                './node_modules/@seald-io/nedb/browser-version/lib/byline.js',
                import.meta.url
              )
            )
          }
      },
    },
    optimizeDeps: {
      include: [
        'util', 'events'
      ]
    },
    define: {
      __APP_VERSION__: JSON.stringify(version),
      __APP_COPYRIGHT__: JSON.stringify(
        description.includes('(C)')
          ? description.substring(description.indexOf('(C)') + 3).trim()
          : '2020- P4mohnet and JSGOE'
      ),
      'process.env': {}
    },
    build: {
      rollupOptions: {
        input: './index.html'
      }
    },
    test: {
      globals: true,
      environment: 'jsdom'
    }
  }
})

