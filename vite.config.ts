import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'

export default defineConfig({
  root: __dirname,
  base: './',
  resolve: {
    alias: {
      '@shared': path.join(__dirname, 'src/shared'),
    },
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
        vite: {
          build: {
            rollupOptions: {
              external: ['electron'],
              output: {
                // .mjs preload must be ESM; default CJS emit uses require() which crashes in preload scope.
                format: 'es',
              },
            },
          },
        },
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
