import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    // Rules integration tests require the Firebase emulator — run separately
    exclude: ['**/node_modules/**', '**/.git/**', 'src/test/firestore.rules.test.js'],
  },
})
