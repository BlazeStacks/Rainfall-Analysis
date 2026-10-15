import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Force all packages to share the same pre-bundled React instance.
    // Without this, react-leaflet gets bundled with its own React copy
    // causing "Invalid hook call / Cannot read null.useState" at runtime.
    include: ['react', 'react-dom', 'leaflet', 'react-leaflet'],
  },
  resolve: {
    // Deduplicate React — ensures only a single copy is resolved across
    // the main app bundle and any peer-dependency bundles.
    dedupe: ['react', 'react-dom'],
  },
})
