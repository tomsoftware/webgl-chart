import path from 'path';
import { defineConfig } from 'vite';

/**
 * Vite config to build a standalone UMD bundle of webgl-lib
 * that can be used directly in browsers without npm.
 *
 * Build with: vite build --config vite.config.umd.ts
 */
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['umd'],
      name: 'WebGLLib',
      fileName: () => 'webgl-lib.umd.js'
    },
    rollupOptions: {
      // No externals - bundle everything
      external: [],
      output: {
        // Output to dist-umd directory
        dir: 'dist-umd'
      },
    },
    // Increase chunk size warning limit for UMD bundle
    chunkSizeWarningLimit: 500,
  },
});