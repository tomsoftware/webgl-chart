<script setup lang="ts">
import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { GpuGrowingBuffer, LayoutCell,Color, EventDispatcher} from '@tomsoftware/webgl-lib';
import { Scale, BasicChartLayout, SeriesRangeRect, SeriesRangeLine} from '@tomsoftware/webgl-chart';
import { Generators } from './generators';

// generate time data
const itemCount = 300;
const time = new GpuGrowingBuffer('float32', itemCount);
const bodyUpperData = new GpuGrowingBuffer('float32', itemCount);
const bodyLowerData = new GpuGrowingBuffer('float32', itemCount);

const wickUpperData = new GpuGrowingBuffer('float32', itemCount);
const wickLowerData = new GpuGrowingBuffer('float32', itemCount);

// generate data
let minY = 1000;
let maxY = 0;

for (let i = 0; i < 300; i++) {
  const d = Generators.generateNextFinanceData();

  time.push(i);
  bodyLowerData.push(d.open);
  bodyUpperData.push(d.close);

  wickUpperData.push(d.high);
  wickLowerData.push(d.low);

  minY = Math.min(minY, d.low);
  maxY = Math.max(maxY, d.high);
}

// create area-series
const bodySeries = new SeriesRangeRect(time, bodyLowerData, bodyUpperData)
    .setColor(Color.darkGreen, Color.red)
    .setBarWidth(0.5);

const wickSeries = new SeriesRangeLine(time, wickLowerData, wickUpperData)
    .setColor(Color.black);

// scales define the range that is shown by the axis
const scaleX = new Scale(0, 100);
const scaleY = new Scale(minY, maxY);

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
      bodySeries.draw(context, scaleX, scaleY, basicLayout.chartCell);
      wickSeries.draw(context, scaleX, scaleY, basicLayout.chartCell);
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