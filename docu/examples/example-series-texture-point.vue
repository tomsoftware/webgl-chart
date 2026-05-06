<script setup lang="ts">
import { Chart, ChartConfig, Utilities } from '@tomsoftware/webgl-chart-vue';
import { GpuGrowingBuffer, LayoutCell, Color, EventDispatcher, TextTextureGenerator, Font, SvgTextureGenerator } from '@tomsoftware/webgl-lib';
import { Scale, BasicChartLayout, SeriesTexturePoint } from '@tomsoftware/webgl-chart';
import { ref } from 'vue';


// access the chart's webGLRenderer
const myChart = ref<InstanceType<typeof Chart> | null>(null);

// Generate data
const numPoints = 200;

const xTimeData = new GpuGrowingBuffer('float32', numPoints).generate((t) => t * 0.1);
const y1Data = GpuGrowingBuffer.generateFrom('float32', xTimeData, (t) => Math.sin(t * 4));
const y2Data = GpuGrowingBuffer.generateFrom('float32', xTimeData, (t) => Math.cos(t * 4));
const y3Data = GpuGrowingBuffer.generateFrom('float32', xTimeData, (t) => Math.tan(t * 1));

// create series drawer
const series1 = new SeriesTexturePoint(xTimeData, y1Data)
  .setColor(Color.blue.withAlpha(0.6))
  .setTextureGenerator(TextTextureGenerator.getCached('X', new Font('sans-serif', 20)));

const series2 = new SeriesTexturePoint(xTimeData, y2Data)
  .setTextureGenerator(TextTextureGenerator.getCached('🦄', new Font('sans-serif', 40)));

const symbolTexture = new SvgTextureGenerator('svg-triangle', `
<svg height="220" width="500" xmlns="http://www.w3.org/2000/svg">
  <polygon points="100, 10 150, 190 50, 190" style="fill:lime;stroke:purple;stroke-width:3" />
</svg>`, /* width: */ 100);

const series3 = new SeriesTexturePoint(xTimeData, y3Data)
  .setTextureGenerator(symbolTexture);


// Scales
const scaleX = new Scale(0, 5);
const scaleY = new Scale(-1.2, 1.2);

// handel events
const eventDispatcher = new EventDispatcher();

// define layout
const baseContainer = new LayoutCell();

// use a basic chart layout for arranging the chart-elements
const basicLayout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
basicLayout.addYScale(scaleY, 'Value');
basicLayout.xAxis.label?.setText('Time');


// Render callback
const chartData = new ChartConfig()
  .setRenderCallback((context) => {
    // arrange layout
    context.calculateLayout(baseContainer);

    // process events
    eventDispatcher.dispatch(context);

    // draw elements of chart-layout
    basicLayout.draw(context);

    //series1.draw(context, scaleX, scaleY, basicLayout.chartCell);
    //series2.draw(context, scaleX, scaleY, basicLayout.chartCell);
    series3.draw(context, scaleX, scaleY, basicLayout.chartCell);
  });
chartData.setMaxFrameRate(15);


// bind events
function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element);
}

function downloadTexture() {
  const renderer = myChart.value?.webGLRenderer;
  if (renderer == null) {
    return;
  }

  const image = renderer.textureContext.exportTextureHtmlImage();
  if (image == null) {
    return;
  }

  // provide the texture as image download
  Utilities.DownloadImage(image, 'texture');
}

</script>

<template>
  <chart
    ref="myChart"
    :data="chartData"
    @on-bind="onBind"
    class="chart"
  />
  <button @click="downloadTexture">Download Texture</button>
</template>

<style scoped>
  .chart {
    width: 100%;
    background-color: white;
  }
</style>