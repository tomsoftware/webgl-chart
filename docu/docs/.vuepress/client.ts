import { defineClientConfig } from 'vuepress/client'
import ExampleTitle from "./../examples/example-title.vue";
import ExampleFull from "./../examples/example-full.vue";

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.component("example-full", ExampleFull);
    app.component("example-title", ExampleTitle);
  },
  setup() {},
  rootComponents: [],
})
