<script setup lang="ts">
import { Chart, ChartConfig } from '@tomsoftware/webgl-chart-vue';
import { GpuGrowingBuffer, LayoutCell, Color, EventDispatcher, TextTextureGenerator, Font  } from '@tomsoftware/webgl-lib';
import { Scale, BasicChartLayout, SeriesTexturePoint } from '@tomsoftware/webgl-chart';

// Generate data
const numPoints = 200;

const xTimeData = new GpuGrowingBuffer('float32', numPoints).generate((t) => t * 0.1);
const y1Data = GpuGrowingBuffer.generateFrom('float32', xTimeData, (t) => Math.random() * 10);
const y2Data = GpuGrowingBuffer.generateFrom('float32', xTimeData, (t) => Math.random() * 10);

// create series drawer
const series1 = new SeriesTexturePoint(xTimeData, y1Data)
  .setColor(Color.blue.withAlpha(0.6))
  .setTextureGenerator(TextTextureGenerator.getCached('0', Font.default));

const series2 = new SeriesTexturePoint(xTimeData, y2Data)
  .setTextureGenerator(TextTextureGenerator.getCached('🦄', Font.default));


// Scales
const scaleX = new Scale(0, 10);
const scaleY = new Scale(0, 10);

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
    // series2.draw(context, scaleX, scaleY, basicLayout.chartCell);
  });
chartData.setMaxFrameRate(15);


// bind events
function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element)
}

function downloadTexture() {

}

</script>

<template>
  <chart
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