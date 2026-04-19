<script setup lang="ts">

import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Generators } from './generators';
import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { Matrix3x3, GpuText, LayoutCell, VerticalLayout, 
  ScreenPosition, Color, Alignment, EventDispatcher, Font,
  GpuGrowingBuffer} from '@tomsoftware/webgl-lib';
import { SeriesPoint, Scale, Annotations, SeriesLine, BasicChartLayout, SeriesBar } from '@tomsoftware/webgl-chart';

let pauseAnimation = ref<boolean>(false);

// generate time data
const time = new GpuGrowingBuffer('float32');
const lineDate1 = new GpuGrowingBuffer('float32');
const pointData = new GpuGrowingBuffer('float32');
const lineData2 = new GpuGrowingBuffer('float32');

// generate series data
const series1 = new SeriesBar(time, lineDate1)
    .setColor(Color.byIndex(0))
    .setBarWidth(0.0007)

const series2 = new SeriesPoint(time, pointData)
    .setColor(Color.byIndex(1))
    .setPointSize(3);

const series3 = new SeriesLine(time, lineData2)
    .setColor(Color.byIndex(2))
    .setThickness(3);

// generate annotations
const annotations = new Annotations();

populate(10);

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
const baseRow = baseContainer.addLayout(new VerticalLayout(ScreenPosition.fromPixel(10)));

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
      series1.draw(context, scaleX, scaleY, basicLayout.chartCell);
      series3.draw(context, scaleX, scaleY, basicLayout.chartCell);
      series2.draw(context, scaleX, scaleY, basicLayout.chartCell);

      // draw annotations
      annotations.draw(context, scaleX, scaleY, basicLayout.chartCell);
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
    if (pauseAnimation.value) {
      return;
    }
    scaleX.pan(-0.001);
  }, 10);
});

onBeforeUnmount(() => {
  window.clearInterval(animationTimer);
});

function populate(timeLengthInMinutes: number) {
  const itemCount = timeLengthInMinutes * 60 * 60 / 4;

  // update time values
  time
    .increaseCapacity(itemCount)
    .generate((i) => i * 0.001); // in seconds

  // generate series data
  lineDate1
    .increaseCapacity(itemCount)
    .generate((t) => Generators.generateEKG(t * 0.01) * 10 - 5)

  pointData
    .increaseCapacity(itemCount)
    .generate((t) => Generators.generateSin(t * 0.003) + 2);

  lineData2
    .increaseCapacity(itemCount)
    .generate((t) => Generators.generateIO(t * 0.01) * 15 + 5)


  // update the annotations
  const numberOfAnnotations = Math.floor(itemCount * 0.003);
  annotations.ensureCapacity(numberOfAnnotations * 3);

  for (const a of Generators.generateAnnotations(itemCount * 0.001, numberOfAnnotations)) {
    annotations.addVerticalLine(a.x, a.color, 10, 2)
      .addLabel(new GpuText(a.text), a.color.withAlpha(0.7));
  }
}

function zoomOut() {
  scaleX.setRange(time.firstComponent(), time.lastComponent());
  pauseAnimation.value = true;
}

</script>

<template>
  <div class="grid-item">
    <button @click="pauseAnimation = !pauseAnimation">{{ pauseAnimation ? 'Run' : 'Pause'}}</button>
    <button @click="zoomOut()">Zoom out</button>
    <button @click="scaleX.setRange(0, 1)">Reset zoom</button>
    <button @click="populate(1200)">Use 3 million data-points</button>
    <button @click="myChart.setMaxFrameRate(60);">Framerate 60 Hz</button>
    <br>
    <chart
      :data="myChart"
      @on-bind="onBind"
      class="chart"
    />
  </div>
</template>

<style scoped>
  .chart {
    background-color: white;
    width: 100%;
  }

  button {
    margin: 1px;
  }

</style>