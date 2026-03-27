<script setup lang="ts">
import { Generators } from './generators';
import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { GpuFloatBuffer, LayoutCell, Color, EventDispatcher, } from '@tomsoftware/webgl-lib';
import {SeriesPoint, BasicChartLayout, Scale } from '@tomsoftware/webgl-chart';
import { ref } from 'vue';
import {PausableTimer} from './pausable-timer';

let pauseAnimation = ref<boolean>(true);
let numPoints = ref<number>(0);

// generate time data
const time = new GpuFloatBuffer(0);
const data1 = new GpuFloatBuffer(0);

// generate series data
const series1 = new SeriesPoint(time, data1)
    .setColor(Color.blue)
    .setPointSize(5);

// scales define the range that is shown by the axis
const scaleX = new Scale(0, 4);
const scaleY = new Scale(0, 25);

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
  });

function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element)
}

// manage chart options
myChart.setMaxFrameRate(12);

const timer = new PausableTimer(false);

// add new data point every 100ms
setInterval(() => {
  if (pauseAnimation.value) {
    timer.pause();
    return;
  } else {
    timer.resume();
  }

  const t = timer.getTime();

  // Add new values to the buffer; it grows automatically as needed.
  for (let i = 0; i < 10; i++) {
    const subTime = t + i * 0.01;
    time.push(subTime);
    data1.push(Generators.generateSin(subTime * 0.1));
  }

  // update scale, having 4% padding on the right
  scaleX.max = Math.max(scaleX.max, t + scaleX.range * 0.04);

  // read number of points in buffer
  numPoints.value = data1.count;

}, 100);

/** reset the chart data */
function clearData() {
  time.clear();
  data1.clear();
  timer.reset();
  scaleX.max = 4;
}

</script>

<template>
  <button @click="pauseAnimation = !pauseAnimation">{{pauseAnimation ? 'run' : 'pause'}}</button>
  <button @click="clearData()">reset</button>
  Number of Points: {{ numPoints }}
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
  button {
    margin: 0 10px 2px 0;
    width: 70px;
  }
</style>