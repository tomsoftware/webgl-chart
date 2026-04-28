import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';

/**
 * Vite config to build a standalone UMD bundle of webgl-chart-vue
 * that can be used directly in browsers without npm.
 * 
 * Build with: vite build --config vite.config.umd.ts
 */
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/index.ts'),
      formats: ['umd'],
      name: 'WebGLChartVue',
      fileName: () => 'webgl-chart-vue.umd.js'
    },
    rollupOptions: {
      // Externalize Vue and the webgl-chart package, so only the Vue wrapper code is bundled here.
      external: ['vue', '@tomsoftware/webgl-chart', '@tomsoftware/webgl-lib'],
      output: {
        globals: {
          'vue': 'Vue',
          '@tomsoftware/webgl-lib': 'WebGLLib',
          '@tomsoftware/webgl-chart': 'WebGLChart',
        },
        // Output to umd directory
        dir: 'dist-umd'
      },
    },
    // Increase chunk size warning limit for UMD bundle
    chunkSizeWarningLimit: 500,
  },
  plugins: [vue()],
});
