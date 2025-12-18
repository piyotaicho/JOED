import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

if (process.env.NODE_ENV === 'production') {
  console.log('Build preload script for production.')
}

// Electronプリロードスクリプト用のVite設定
export default defineConfig({
  // Node.js環境でのビルドを明示
  ssr: {
    noExternal: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    // SSR（Server-Side Rendering）モード = Node.js環境
    ssr: true,
    lib: {
      entry: fileURLToPath(new URL('./src/preload.js', import.meta.url)),
      formats: ['cjs'],
      fileName: () => 'preload.cjs'
    },
    rollupOptions: {
      external: ['electron'],
      output: {
        format: 'cjs'
      }
    },
    minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
    sourcemap: process.env.NODE_ENV !== 'production',
    target: 'node20'
  }
})
