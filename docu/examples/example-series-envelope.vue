<script setup lang="ts">
import { Generators } from './generators';

import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { Series, GpuFloatBuffer, LayoutCell,
  Color, Scale, EventDispatcher, BasicChartLayout, SeriesEnvelope} from '@tomsoftware/webgl-chart';

// generate time data
const itemCount = 100 * 60 * 60 / 4;
const time = new GpuFloatBuffer(itemCount)
    .generate((i) => i * 0.001); // in seconds

const upperData = GpuFloatBuffer.generateFrom(time, (t) => Generators.generateSin2(t + 0.01) );
const lowerData = GpuFloatBuffer.generateFrom(time, (t) => Generators.generateSin2(t) - 10);

// generate series data
const envelope1 = new SeriesEnvelope(time, upperData, lowerData)
    .setColor(Color.lightBlue, Color.blue);

const series1 = new Series(time, upperData)
    .setColor(Color.red)
    .setPointSize(4)

const series2 = new Series(time, lowerData)
    .setColor(Color.red)
    .setPointSize(4)

// scales define the range that is shown by the axis
const scaleX = new Scale(0, 1);
const scaleY = new Scale(-15, 25);

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
      envelope1.draw(context, scaleX, scaleY, basicLayout.chartCell);

      series1.drawLines(context, scaleX, scaleY, basicLayout.chartCell);
      series2.drawPoints(context, scaleX, scaleY, basicLayout.chartCell);
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
  height: 300px;
  background-color: white;
}

</style>