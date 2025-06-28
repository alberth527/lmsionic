
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  base: process.env.NODE_ENV === 'production' ? '/lmsionic/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8100
  },
  build: {
    rollupOptions: {
      output: {
        // 完全關閉代碼分割，所有代碼打包成單一檔案
        manualChunks: undefined,
        inlineDynamicImports: true // 關鍵：內聯所有動態導入
      }
    },
    target: 'esnext',
    minify: 'esbuild',
    assetsDir: 'assets'
  }
})