import { defineClientConfig } from 'vuepress/client'
import ExampleTitle from "./../../examples/example-title.vue";
import ExampleFull from "./../../examples/example-full.vue";
import ExampleBasic from "./../../examples/example-basic.vue";
import ExampleStacked from "./../../examples/example-stacked.vue";

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.component("example-full", ExampleFull);
    app.component("example-title", ExampleTitle);
    app.component("example-basic", ExampleBasic);
    app.component("example-stacked", ExampleStacked);
  },
  setup() {},
  rootComponents: [],
})
