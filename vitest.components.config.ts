import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import preact from '@preact/preset-vite'

const { RENDERER } = process.env
const plugins = RENDERER === 'preact' ? [preact()] : [react()]
const resolve = RENDERER === 'preact'
  ? {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat'
    }
  }
  : undefined

export default defineConfig({
  plugins,
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'src/components/**/*.test.ts',
      'src/components/**/*.test.tsx'
    ]
  },
  resolve
})
