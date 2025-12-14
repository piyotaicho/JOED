import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// Electronメインプロセス用のVite設定
export default defineConfig({
  // Node.js環境でのビルドを明示
  ssr: {
    noExternal: true
  },
  build: {
    // メインプロセスのビルド先
    outDir: 'dist-electron',
    emptyOutDir: true,
    // SSR（Server-Side Rendering）モード = Node.js環境
    ssr: true,
    // ライブラリモードでビルド
    lib: {
      entry: fileURLToPath(new URL('./src/background.js', import.meta.url)),
      formats: ['es'],
      fileName: () => 'background.js'
    },
    rollupOptions: {
      external: [
        // Electron関連
        'electron',
        'electron-store',
        '@seald-io/nedb',
        'xxhashjs',
        // Node.js組み込みモジュール
        'path',
        'fs',
        'crypto',
        'stream',
        'util',
        'events',
        'os',
        'child_process',
        'http',
        'https',
        'url',
        'zlib',
        'buffer',
        'module'
      ],
      output: {
        // ES Modules形式で出力
        format: 'es',
        // 外部依存をそのままimportとして保持
        preserveModules: false
      }
    },
    // minify設定
    minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
    sourcemap: process.env.NODE_ENV !== 'production',
    target: 'node20'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
