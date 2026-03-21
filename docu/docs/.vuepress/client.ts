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
import ExampleSeriesArea from '../../examples/example-series-area.vue';
import ExampleTooltip from './../../examples/example-tooltip.vue';
import ExampleEventHandling from './../../examples/example-event-handling.vue';
import ExampleHorizontalLayout from './../../examples/example-horizontal-layout.vue';
import ExampleVerticalLayout from './../../examples/example-vertical-layout.vue';
import ExampleIntersectedLayout from './../../examples/example-intersected-layout.vue';
import ExampleSeriesBubble from '../../examples/example-series-bubble.vue';
import ExampleSeriesBar from '../../examples/example-series-bar.vue';

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
    app.component('example-series-area', ExampleSeriesArea);
    app.component('example-tooltip', ExampleTooltip);
    app.component('example-event-handling', ExampleEventHandling);
    app.component('example-horizontal-layout', ExampleHorizontalLayout);
    app.component('example-vertical-layout', ExampleVerticalLayout);
    app.component('example-intersected-layout', ExampleIntersectedLayout);
    app.component('example-series-bubble', ExampleSeriesBubble);
    app.component('example-series-bar', ExampleSeriesBar);
    
  },
  setup() {},
  rootComponents: [],
})
