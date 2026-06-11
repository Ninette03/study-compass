import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// Resolves figma:asset/ imports to src/assets/ directory
function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    // NOTE: @tailwindcss/vite removed — using PostCSS + tailwindcss v3 instead
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
