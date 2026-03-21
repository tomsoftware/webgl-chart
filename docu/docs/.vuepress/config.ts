import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'
import { myPlugin } from './plugins/code'
import path from 'path'

export default defineUserConfig({
  lang: 'en-US',

  title: 'WebGl-Chart Documentation',
  description: 'High performance web chart library to plot line-charts, area-charts, bubble-charts, bar-chart and annotations using WebGL',

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
        text: 'Features',
        link: '/features/basic',
        activeMatch: "^/features/"
      },{
        text: 'Source',
        link: 'https://github.com/tomsoftware/webgl-chart',
      }
    ],
    sidebar: {
      '/api/': [{
        text: 'API',
        collapsible: false,
        prefix: '/api/',
        children: [
          'introduction',
          'renderer',
          'layout',
          'draw-text',
          'event-handling'
        ]
      }],
      '/features/': [{
          text: 'Features',
          collapsible: false,
          prefix: '/features/',
          children: [
            'basic',
            'stacked',
            'annotations',
            'axis',
            'series-bar',
            'series-area',
            'series-bubble',
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
          '@tomsoftware/webgl-lib': path.resolve(__dirname, '../../../packages/webgl-lib/src/index.ts'),
        }
      },
    }
  }),
  plugins: [
      myPlugin()
    ]
})
