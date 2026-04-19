<script setup lang="ts">
import { Chart, ChartConfig } from '@tomsoftware/webgl-chart-vue';
import { GpuGrowingBuffer, LayoutCell, Color, EventDispatcher } from '@tomsoftware/webgl-lib';
import { SeriesBar, Scale, BasicChartLayout } from '@tomsoftware/webgl-chart';

// Generate circle data
const numBars = 200;

const xTimeData = new GpuGrowingBuffer('float32', numBars).generate((t) => t * 0.1);
const yData = GpuGrowingBuffer.generateFrom('float32', xTimeData, (t) => Math.random() * 20 - 10);

// create series drawer
const series1 = new SeriesBar(xTimeData, yData)
  .setColor(Color.blue.withAlpha(0.6))
  .setBarWidth(0.04)
  .setOffsetX(0)

const series2 = new SeriesBar(
    xTimeData,
     GpuGrowingBuffer.generateFrom('float32', xTimeData, (t) => Math.sin(t * 1) * 10),
  )
  .setColor(Color.red.withAlpha(0.6))
  .setBarWidth(0.04)
  .setOffsetX(0.04)


// Scales
const scaleX = new Scale(0, 10);
const scaleY = new Scale(-10, 10);

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
  });
chartData.setMaxFrameRate(15);

// bind events
function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element)
}


</script>

<template>
  <chart
    :data="chartData"
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