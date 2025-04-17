<script setup lang="ts">
import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { Series, GpuFloatBuffer, LayoutCell,
  Color, Scale, EventDispatcher, BasicChartLayout, SeriesEnvelope} from '@tomsoftware/webgl-chart';
import { ref } from 'vue';

const drawLines = ref<boolean>(false);
const drawDots = ref<boolean>(true);
const drawBounds = ref<boolean>(true);

// generate time data
const itemCount = 3000;
const time = new GpuFloatBuffer(itemCount)
    .generate((i) => i * 0.001); // in seconds

// generate data
const upperData = GpuFloatBuffer.generateFrom(time, (t) => 1 / t );
const lowerData = GpuFloatBuffer.generateFrom(time, (t) => -1 / t );
function sinData(t: number, offset: number) {
  return (1.0 / t) * Math.sin(t * 1 * 100 - offset);
}

const data = GpuFloatBuffer.generateFrom(time, t => sinData(t, 0));

// create area-series
const envelope1 = new SeriesEnvelope(time, upperData, lowerData)
    .setColor(Color.darkGray, Color.lightGray);

const seriesUpper = new Series(time, upperData)
    .setColor(Color.black);

const seriesLower = new Series(time, lowerData)
    .setColor(Color.black);

// create inner sin-series
const series1 = new Series(time, data)
    .setColor(Color.red)
    .setPointSize(4)

// scales define the range that is shown by the axis
const scaleX = new Scale(0, 1);
const scaleY = new Scale(-30, 30);

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

      if (drawLines.value) {
        series1.drawLines(context, scaleX, scaleY, basicLayout.chartCell);

        if (drawBounds.value) {
          seriesLower.drawLines(context, scaleX, scaleY, basicLayout.chartCell);
          seriesUpper.drawLines(context, scaleX, scaleY, basicLayout.chartCell);
        }
      }
      if (drawDots.value) {
        series1.drawPoints(context, scaleX, scaleY, basicLayout.chartCell);

        if (drawBounds.value) {
          seriesLower.drawPoints(context, scaleX, scaleY, basicLayout.chartCell);
          seriesUpper.drawPoints(context, scaleX, scaleY, basicLayout.chartCell);
        }
      }

  });

// data-animation
let timeOffset = 0;
window.setInterval(() => {
  data.clear();
  data.generate(i => sinData(time.get(i)[0], timeOffset));
  timeOffset += 1;
}, 100);

// bind events
function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element)
}

// manage chart options
myChart.setMaxFrameRate(12);

</script>

<template>
  <label><input type="checkbox" v-model="drawLines">draw lines</label>
  <label><input type="checkbox" v-model="drawDots">draw dots</label>
  <label><input type="checkbox" v-model="drawBounds">draw bounds</label>
  <br />
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
label {
  padding-right: 10pt;
}

</style>