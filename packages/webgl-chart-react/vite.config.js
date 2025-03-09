import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/index.ts'),
      formats: ['es'],
      name: 'webgl-chart-react',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@tomsoftware/webgl-chart'
      ],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        },
      },
    },
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['lib']
    })
  ],
});
