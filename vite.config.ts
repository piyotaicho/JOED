/**
 * viteで生成するweb専用版の設定ファイル (electron版とは別)
 */
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { version, description } from './package.json'

export default defineConfig(({ mode }) => {
  return {
    base: './',
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // ラッパーはブラウザ版を指定
        'depmodules': fileURLToPath(new URL('./src/modules/serve', import.meta.url)),
        util: 'util/',
        events: 'events/',
        process: 'process/browser',
        // nedbエンジンはのブラウザ版を使うように指定
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
        ),
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
      __APP_ELECTRON__: JSON.stringify('false'),
      'process.env': {}
    },
    build: {
      emptyOutDir: true,
      outDir: 'dist',
      rolldownOptions: {
        input: './index.html'
      },
      minify: mode === 'production',
      sourcemap: mode !== 'production'
    },
    test: {
      globals: true,
      environment: 'jsdom'
    }
  }
})

