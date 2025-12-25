import { defineConfig } from 'electron-vite'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { readFileSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// package.jsonを読み込み
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
)
const { version, description } = packageJson

export default defineConfig(() => {
  return {
    // メインプロセス設定は不具合のため分離
    // プリロードスクリプト設定
    preload: {
      build: {
        emptyOutDir: false,
        rollupOptions: {
          input: resolve(__dirname, 'src/preload.js'),
          output: {
            dir: resolve(__dirname, 'dist'),
            entryFileNames: 'preload.cjs',
            format: 'cjs' as const
          },
          external: ['electron']
        }
      },
      define: {
        __APP_VERSION__: JSON.stringify(version),
        __APP_COPYRIGHT__: JSON.stringify(
          description.includes('(C)')
            ? description.substring(description.indexOf('(C)') + 3).trim()
            : '2020- P4mohnet and JSGOE'
        ),
        __APP_ELECTRON__: JSON.stringify('true'),
        'process.env': {}
      }
    },

    // レンダラープロセス（フロントエンド）設定
    renderer: {
      root: '.',
      build: {
        emptyOutDir: false,
        outDir: 'dist',
        rollupOptions: {
          input: './index.html'
        }
      },
      plugins: [
        vue(),
        vueDevTools(),
      ],
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
          'depmodules': resolve(__dirname, 'src/modules/electron')
        }
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
        __APP_ELECTRON__: JSON.stringify('true'),
        'process.env': {}
      }
    }
  }
})
