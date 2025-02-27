<script setup lang="ts">

import { onBeforeUnmount, onMounted } from 'vue';
import { Generators } from './generators';

import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { Series, Matrix3x3, GpuFloatBuffer, GpuText, LayoutCell,
  VerticalLayout, ScreenPosition, Color, Alignment,  Scale,
  EventDispatcher, Font, BasicChartLayout} from '@tomsoftware/webgl-chart';

// generate time data
const itemCount = 1000 * 60 * 60 / 4;
const time = new GpuFloatBuffer(itemCount)
    .generate((i) => i * 0.001); // in seconds

// generate series data
const series1 = new Series(time)
    .generate((t) => 10 + Math.sin(t * 2 * Math.PI) * 10 + Math.random() * 2)
    .setColor(Color.blue)
    .setPointSize(5);

const series2 = new Series(time)
    .generate((t) => Generators.generateEKG(t * 10) * 10)
    .setColor(Color.red)
    .setPointSize(4)

const series3 = new Series(time)
    .generate((t) => Generators.iOSimulation(t * 10) * 20)
    .setColor(Color.darkGreen)
    .setPointSize(4)

// scales define the range that is shown by the axis
const scaleX = new Scale(0, 1);
const scaleY = new Scale(-15, 25);

// define some text fot the headline
const headline = new GpuText('My new WebGl-Chart', new Font(undefined, 15));

// handel events
const eventDispatcher = new EventDispatcher();

// define layout
const baseContainer = new LayoutCell();

// add a vertical layout-container with some padding
const baseRow = baseContainer.addLayout(new VerticalLayout(ScreenPosition.FromPixel(10)));

// fist item for headline
const headlineLayout = baseRow.addFixedCell([headline]);
// second item for the chart
const innerContainer = baseRow.addRelativeCell(1);

// use a basic chart layout for arranging the chart-elements
const basicLayout = new BasicChartLayout(eventDispatcher, innerContainer, scaleX);
basicLayout.addYScale(scaleY, 'Value');
basicLayout.xAxis.label?.setText('Time');

// set render callback: here you need to define what elements you want to draw
const myChart = new ChartConfig()
    .setRenderCallback((context) => {

      // arrange layout
      context.calculateLayout(baseContainer);

      // process events
      eventDispatcher.dispatch(context);

      // draw headline text
      headline.draw(context, headlineLayout, Alignment.centerCenter, new Matrix3x3());

      // draw elements of chart-layout
      basicLayout.draw(context);

      // draw the series
      series1.drawLines(context, scaleX, scaleY, basicLayout.chartCell);
      series3.drawLines(context, scaleX, scaleY, basicLayout.chartCell);
      series2.drawPoints(context, scaleX, scaleY, basicLayout.chartCell);
  });

function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element)
}

// manage chart options
myChart.setMaxFrameRate(12);

// animation
let animationTimer: number = 0;
onMounted(() => {
  animationTimer = window.setInterval(() => {
    scaleX.pan(-0.01);
  }, 100);
});

onBeforeUnmount(() => {
  window.clearInterval(animationTimer);
});

</script>

<template>
  <div class="grid-item">
    <chart
      :data="myChart"
      @on-bind="onBind"
      class="chart"
    />
  </div>
</template>

<style scoped>
.chart {
  height: 300px;
  background-color: white;
}

</style>