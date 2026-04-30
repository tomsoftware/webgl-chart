import path from 'path';
import { defineConfig } from 'vite';

/**
 * Vite config to build a standalone UMD bundle of webgl-chart
 * that can be used directly in browsers without npm.
 *
 * Build with: vite build --config vite.config.umd.ts
 */
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['umd'],
      name: 'WebGLChart',
      fileName: () => 'webgl-chart.umd.js'
    },
    rollupOptions: {
      // Do not include externals
      external: ['@tomsoftware/webgl-lib'],
      output: {
        globals: {
          '@tomsoftware/webgl-lib': 'WebGLLib'
        },
        // Output to dist-umd directory
        dir: 'dist-umd'
      },
    },
    // Increase chunk size warning limit for UMD bundle
    chunkSizeWarningLimit: 500,
  },
});