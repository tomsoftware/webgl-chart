<script setup lang="ts">
import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { LayoutCell, Color, EventDispatcher, GpuRingBuffer, } from '@tomsoftware/webgl-lib';
import { SeriesPoint, BasicChartLayout, Scale } from '@tomsoftware/webgl-chart';
import { PausableTimer} from './pausable-timer';
import { Generators } from './generators';
import { ref, watch } from 'vue';

let pauseAnimation = ref<boolean>(true);
let numPoints = ref<number>(0);

// generate time data
const time = new GpuRingBuffer('float32', 300);
const data1 = new GpuRingBuffer('float32', 300);

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

// add new data point every 100ms
const timer = new PausableTimer((t) => {
  // Add new values to the buffer; it grows automatically as needed.
  for (let i = 0; i < 10; i++) {
    const subTime = t + i * 0.01;
    time.push(subTime);
    data1.push(Generators.generateSin(subTime * 0.1));
  }

  // update scale, having 4% padding on the right
  const padding = scaleX.range * 0.04;
  scaleX.max = Math.max(scaleX.max, t + padding * 2);
  scaleX.min = (time.firstAttribute[0] ?? 0) - padding;

  // read number of points in buffer
  numPoints.value = data1.count;

}, 100, !pauseAnimation.value);

/** reset the chart data */
function clearData() {
  time.clear();
  data1.clear();
  timer.reset();
  scaleX.max = 4;
}

// map pauseAnimation to timer state
watch(pauseAnimation, (value) => {
  if (timer) {
    timer.enable(!value); 
  }
});

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