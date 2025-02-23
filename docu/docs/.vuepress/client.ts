import { defineClientConfig } from 'vuepress/client'
import ExampleFull from "./plugins/example-full.vue";

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.component("example-full", ExampleFull);
  },
  setup() {},
  rootComponents: [],
})
