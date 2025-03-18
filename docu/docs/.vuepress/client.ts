import { defineClientConfig } from 'vuepress/client'
import ExampleTitle from "./../../examples/example-showcase.vue";
import ExampleFull from "./../../examples/example-full.vue";
import ExampleBasic from "./../../examples/example-basic.vue";
import ExampleStacked from "./../../examples/example-stacked.vue";
import ExampleAnnotations from "./../../examples/example-annotations.vue";
import ExampleAxis from "../../examples/example-multi-axis.vue";
import ExampleGpuTextAlignment from "./../../examples/example-gpu-text-alignment.vue";
import ExampleGpuTextRotation from "./../../examples/example-gpu-text-rotation.vue";

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.component("example-full", ExampleFull);
    app.component("example-showcase", ExampleTitle);
    app.component("example-basic", ExampleBasic);
    app.component("example-stacked", ExampleStacked);
    app.component("example-annotations", ExampleAnnotations);
    app.component("example-multi-axis", ExampleAxis);
    app.component("example-gpu-text-alignment", ExampleGpuTextAlignment);
    app.component("example-gpu-text-rotation", ExampleGpuTextRotation);
  },
  setup() {},
  rootComponents: [],
})
