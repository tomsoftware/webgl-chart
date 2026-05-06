<script setup lang="ts">
import { Chart, ChartConfig, Utilities } from '@tomsoftware/webgl-chart-vue';
import { GpuGrowingBuffer, LayoutCell, Color, EventDispatcher, TextTextureGenerator, Font, SvgTextureGenerator } from '@tomsoftware/webgl-lib';
import { Scale, BasicChartLayout, SeriesTexturePoint } from '@tomsoftware/webgl-chart';
import { ref } from 'vue';

// Generate data
const numPoints = 200;

const xTimeData = new GpuGrowingBuffer('float32', numPoints).generate((t) => t * 0.1);
const y1Data = GpuGrowingBuffer.generateFrom('float32', xTimeData, (t) => Math.sin(t * 4));
const y2Data = GpuGrowingBuffer.generateFrom('float32', xTimeData, (t) => Math.cos(t * 4));
const y3Data = GpuGrowingBuffer.generateFrom('float32', xTimeData, (t) => Math.tan(t * 1));

// create series drawer

// use a X as marker
const series1 = new SeriesTexturePoint(xTimeData, y1Data)
  .setColor(Color.blue)
  .setTextureGenerator(TextTextureGenerator.getCached('X', new Font('sans-serif', 10)));

// use unicode letter as marker
const series2 = new SeriesTexturePoint(xTimeData, y2Data)
  .setTextureGenerator(TextTextureGenerator.getCached('🦄', new Font('sans-serif', 15)));

// use svg as marker
const starMarkerTexture = new SvgTextureGenerator('svg-marker-star', `
<svg xmlns="http://www.w3.org/2000/svg" width="300px" height="275px">
  <path
    fill="white"
    stroke="black"
    stroke-width="10"
    d="M150,25 L179,111 L269,111 L197,165 L223,251  L150,200 L77,251  L103,165 L31,111 L121,111Z"
  />
</svg>`, /* width: */ 30);

const series3 = new SeriesTexturePoint(xTimeData, y3Data)
  .setTextureGenerator(starMarkerTexture)
  .setColor(Color.green);


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

    series1.draw(context, scaleX, scaleY, basicLayout.chartCell);
    series2.draw(context, scaleX, scaleY, basicLayout.chartCell);
    series3.draw(context, scaleX, scaleY, basicLayout.chartCell);
  });
chartData.setMaxFrameRate(15);


// bind events
function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element);
}

// this is for demonstration purees so the user can download the generated texture map
// access the chart's WebGlChart
const myChart = ref<InstanceType<typeof Chart> | null>(null);

function downloadTexture() {
  const renderer = myChart.value?.WebGlChart;
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
  <button @click="downloadTexture">Download Texture Map</button>
</template>

<style scoped>
  .chart {
    width: 100%;
    background-color: white;
  }
</style>