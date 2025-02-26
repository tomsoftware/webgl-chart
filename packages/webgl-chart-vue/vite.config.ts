import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      name: 'webgl-chart-vue',
    },
    rollupOptions: {
      external: ['vue', '@tomsoftware/webgl-chart'],
      output: {
        globals: {
          Vue: 'vue',
          '@tomsoftware/webgl-chart': 'WebGLChart'
        },
      },
    },
  },
  plugins: [vue(), dts()],
});
