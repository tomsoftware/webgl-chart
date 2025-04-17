import { defineClientConfig } from 'vuepress/client'
import ExampleTitle from './../../examples/example-showcase.vue';
import ExampleFull from './../../examples/example-full.vue';
import ExampleBasic from './../../examples/example-basic.vue';
import ExampleStacked from './../../examples/example-stacked.vue';
import ExampleAnnotations from './../../examples/example-annotations.vue';
import ExampleAxis from '../../examples/example-multi-axis.vue';
import ExampleGpuTextAlignment from './../../examples/example-gpu-text-alignment.vue';
import ExampleGpuTextRotation from './../../examples/example-gpu-text-rotation.vue';
import ExampleLetterGpuTextRotation from './../../examples/example-gpu-letter-text-rotation.vue';
import ExampleSeriesEnvelope from './../../examples/example-series-envelope.vue';
import ExampleTooltip from './../../examples/example-tooltip.vue';

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.component('example-full', ExampleFull);
    app.component('example-showcase', ExampleTitle);
    app.component('example-basic', ExampleBasic);
    app.component('example-stacked', ExampleStacked);
    app.component('example-annotations', ExampleAnnotations);
    app.component('example-multi-axis', ExampleAxis);
    app.component('example-gpu-text-alignment', ExampleGpuTextAlignment);
    app.component('example-gpu-text-rotation', ExampleGpuTextRotation);
    app.component('example-gpu-letter-text-rotation', ExampleLetterGpuTextRotation);
    app.component('example-series-envelope', ExampleSeriesEnvelope);
    app.component('example-tooltip', ExampleTooltip);
  },
  setup() {},
  rootComponents: [],
})
