<script setup lang="ts">
import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { GpuBuffer, LayoutCell,Color, EventDispatcher} from '@tomsoftware/webgl-lib';
import { Scale, BasicChartLayout, SeriesArea} from '@tomsoftware/webgl-chart';

// generate time data
const itemCount = 300;
const time = new GpuBuffer('float32', itemCount)
    .generate((i) => i * 0.1); // in seconds

// generate data
const upperData = GpuBuffer.generateFrom('float32', time, (t) => Math.sin(t) + 1);
const lowerData = GpuBuffer.generateFrom('float32', time, (t) => Math.sin(t) - 1);

// create area-series
const area1 = new SeriesArea(time, upperData, lowerData)
    .setColor(Color.lightBlue, Color.lightGray)

// scales define the range that is shown by the axis
const scaleX = new Scale(0, 10);
const scaleY = new Scale(-2, 2);

// handle events
const eventDispatcher = new EventDispatcher();

// define layout
const baseContainer = new LayoutCell();

// use a basic chart layout for arranging the chart-elements
const basicLayout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
basicLayout.addYScale(scaleY, 'Value');
basicLayout.xAxis.label?.setText('Time');

// set render callback: here you need to define what elements you want to draw
const myChart = new ChartConfig()
    .setRenderCallback((context) => {
      // arrange layout
      context.calculateLayout(baseContainer);

      // process events
      eventDispatcher.dispatch(context);

      // draw elements of chart-layout
      basicLayout.draw(context);

      // draw the series
      area1.draw(context, scaleX, scaleY, basicLayout.chartCell);
  });

// bind events
function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element)
}

// manage chart options
myChart.setMaxFrameRate(12);

</script>

<template>
  <chart
    :data="myChart"
    @on-bind="onBind"
    class="chart"
  />
</template>

<style scoped>
  .chart {
    width: 100%;
    background-color: white;
  }
</style>