import { defineConfig } from 'vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { builtinModules } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))

// package.jsonを読み込み
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
)
const { version, description } = packageJson

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __APP_DESCRIPTION__: JSON.stringify(description)
  },
  ssr: {
    noExternal: true,
    external: [
      'electron',
      ...builtinModules.map(m => `node:${m}`)
    ]
  },
  build: {
    ssr: true,
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/background.js'),
      formats: ['es'],
      fileName: () => 'background.js'
    },
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`)
      ]
    },
    minify: false,
    sourcemap: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
