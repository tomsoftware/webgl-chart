import { markdownContainerPlugin } from '@vuepress/plugin-markdown-container'

export default function myPlugin(options) {
    // https://ecosystem.vuejs.press/plugins/markdown/markdown-container.html#after
    return markdownContainerPlugin({
        type: 'thomas',
        before: () => '<div><b>GO2!',
        after: () => '</b></div>'
    })
}
