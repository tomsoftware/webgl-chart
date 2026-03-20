<script setup lang="ts">
import { Generators } from './generators';

import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { GpuFloatBuffer, LayoutCell, Color, EventDispatcher} from '@tomsoftware/webgl-lib';
import { SeriesPoint, Scale,  BasicChartLayout, VerticalAxisPosition, SeriesLine} from '@tomsoftware/webgl-chart';

// generate time data
const itemCount = 1000 * 60 * 60 / 4;
const time = new GpuFloatBuffer(itemCount)
    .generate((i) => i * 0.001); // in seconds

// generate series data
const series1 = new SeriesPoint(time)
    .generate((t) => Generators.generateSin(t))
    .setColor(Color.blue)
    .setPointSize(5);

const series2 = new SeriesLine(time)
    .generate((t) => Generators.generateEKG(t * 10) * 10)
    .setColor(Color.red);

const series3 = new SeriesLine(time)
    .generate((t) => Generators.generateIO(t * 10) * 20)
    .setColor(Color.darkGreen)

// scales define the range that is shown by the axis
const scaleX = new Scale(0, 1);
const scaleY1 = new Scale(-30, 60);
const scaleY2 = new Scale(-60, 25);
const scaleY3 = new Scale(-5, 70);

// handel events
const eventDispatcher = new EventDispatcher();

// define layout
const baseContainer = new LayoutCell();


// use a basic chart layout for arranging the chart-elements
const basicLayout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
basicLayout.addYScale(scaleY1, 'Axis 1')
  .setTickColor(series1.color);
basicLayout.addYScale(scaleY2, 'Axis 2')
  .setTickColor(series2.color);
basicLayout.addYScale(scaleY3, 'Axis 3', VerticalAxisPosition.Right)
  .setTickColor(series3.color)
  .axis.setGridColor(Color.red);

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
      series1.draw(context, scaleX, scaleY1, basicLayout.chartCell);
      series2.draw(context, scaleX, scaleY2, basicLayout.chartCell);
      series3.draw(context, scaleX, scaleY3, basicLayout.chartCell);
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