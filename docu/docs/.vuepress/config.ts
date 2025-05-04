import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'
import { myPlugin } from './plugins/code'
import path from 'path'

export default defineUserConfig({
  lang: 'en-US',

  title: 'WebGl-Chart Documentation',
  description: 'High performance web chart library to plot line-charts, area-charts and annotations using WebGL',

  head: [
    ['link', { rel: "icon", type: "image/x-icon", href: "/favicon.ico"}]
  ],

  theme: defaultTheme({
    logo: '/webgl-chart-logo.svg',
    navbar: [
      '/',
      '/get-started',
      {
        text: 'API',
        link: '/api/introduction',
        activeMatch: "^/api/"
      }, {
        text: 'Examples',
        link: '/examples/basic',
        activeMatch: "^/examples/"
      }],
    sidebar: {
      '/api/': [{
        text: 'API',
        collapsible: false,
        prefix: '/api/',
        children: [
          'introduction',
          'renderer',
          'draw-text'
        ]
      }],
      '/examples/': [{
          text: 'Examples',
          collapsible: false,
          prefix: '/examples/',
          children: [
            'basic',
            'stacked',
            'annotations',
            'axis',
            'series-envelope',
            'tooltip',
          ]
      }]
    }
  }),

  bundler: viteBundler({
    viteOptions: {
      resolve: {
        alias: {
          '@tomsoftware/webgl-chart-vue': path.resolve(__dirname, '../../../packages/webgl-chart-vue/lib/index.ts'),
          '@tomsoftware/webgl-chart': path.resolve(__dirname, '../../../packages/webgl-chart/src/index.ts'),
        }
      },
    }
  }),
  plugins: [
      myPlugin()
    ]
})
