<script setup lang="ts">
import { Generators } from './generators';

import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { GpuFloatBuffer, LayoutCell, Color, EventDispatcher, } from '@tomsoftware/webgl-lib';
import {SeriesPoint, BasicChartLayout, SeriesLine, Scale,
  SeriesBar} from '@tomsoftware/webgl-chart';

// generate time data
const itemCount = 1000 * 60 * 60 / 4;
const time = new GpuFloatBuffer(itemCount)
    .generate((i) => i * 0.001); // in seconds

// generate series data
const series1 = new SeriesPoint(time)
    .generate((t) => Generators.generateSin(t))
    .setColor(Color.blue)
    .setPointSize(5);

const series2 = new SeriesBar(
  time,
  GpuFloatBuffer.generateFrom(time, (t) => Generators.generateEKG(t * 10) * 10)
)
    .setColor(Color.red)
    .setBarWidth(0.0008)

const series3 = new SeriesLine(time)
    .generate((t) => Generators.generateIO(t * 10) * 20)
    .setColor(Color.darkGreen)
    .setThickness(2)

// scales define the range that is shown by the axis
const scaleX = new Scale(0, 1);
const scaleY = new Scale(-5, 25);

// handel events
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
      series1.draw(context, scaleX, scaleY, basicLayout.chartCell);
      series3.draw(context, scaleX, scaleY, basicLayout.chartCell);
      series2.draw(context, scaleX, scaleY, basicLayout.chartCell);
  });

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