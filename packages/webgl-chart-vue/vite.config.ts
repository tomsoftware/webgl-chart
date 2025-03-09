import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/index.ts'),
      formats: ['es'],
      name: 'webgl-chart-vue',
    },
    rollupOptions: {
      external: [
        'vue',
        '@tomsoftware/webgl-chart'
      ],
      output: {
        globals: {
          'Vue': 'vue'
        },
      },
    },
  },
  plugins: [vue(), dts({
    insertTypesEntry: true,
    include: ['lib']
  })],
});
