import { defineClientConfig } from 'vuepress/client'
import ExampleTitle from "./../../examples/example-showcase.vue";
import ExampleFull from "./../../examples/example-full.vue";
import ExampleBasic from "./../../examples/example-basic.vue";
import ExampleStacked from "./../../examples/example-stacked.vue";
import ExampleAnnotations from "./../../examples/example-annotations.vue";

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.component("example-full", ExampleFull);
    app.component("example-showcase", ExampleTitle);
    app.component("example-basic", ExampleBasic);
    app.component("example-stacked", ExampleStacked);
    app.component("example-annotations", ExampleAnnotations);
  },
  setup() {},
  rootComponents: [],
})
