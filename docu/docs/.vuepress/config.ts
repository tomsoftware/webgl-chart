import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'
import myPlugin from './plugins/code'
import path from 'path'

export default defineUserConfig({
  lang: 'en-US',

  title: 'VuePress',
  description: 'My first VuePress Site',

  theme: defaultTheme({
    logo: 'https://vuejs.press/images/hero.png',

    navbar: ['/', '/get-started'],
  }),

  bundler: viteBundler({
    viteOptions: {
      resolve: {
        alias: {
          '@hmilch': path.resolve(__dirname, '../../../packages'),
        }
      },
    }
  }),
  plugins: [
      myPlugin()
    ]
})
