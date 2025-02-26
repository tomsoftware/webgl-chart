import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'
import { myPlugin } from './plugins/code'
import path from 'path'

export default defineUserConfig({
  lang: 'en-US',

  title: 'WebGl-Chart Documentation',
  description: 'High performance web chart library to plot line-charts using WebGL',

  theme: defaultTheme({
    logo: 'https://vuejs.press/images/hero.png',
    navbar: ['/', '/get-started', '/api'],
  }),

  bundler: viteBundler({
    viteOptions: {
      resolve: {
        alias: {
          '@tomsoftware/webgl-chart-vue': path.resolve(__dirname, '../../../packages/webgl-chart-vue/src/index.ts'),
          '@tomsoftware/webgl-chart': path.resolve(__dirname, '../../../packages/webgl-chart/src/index.ts'),
        }
      },
    }
  }),
  plugins: [
      myPlugin()
    ]
})
