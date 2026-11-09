import { copyFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-legacy-exam-library',
      apply: 'build',
      closeBundle() {
        copyFileSync(
          resolve(rootDir, 'english-exam-master.html'),
          resolve(rootDir, 'dist/english-exam-master.html')
        )
      }
    }
  ]
})
