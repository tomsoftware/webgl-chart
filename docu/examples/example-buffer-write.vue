<script setup lang="ts">
import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { LayoutCell, Color, EventDispatcher, GpuRingBuffer, GpuFixBuffer, EventTypes, Vector2, LayoutArea, } from '@tomsoftware/webgl-lib';
import { SeriesPoint, BasicChartLayout, Scale } from '@tomsoftware/webgl-chart';
import { Generators } from './generators';
import { ref } from 'vue';

let numPoints = ref<number>(0);

// generate time data
const time = new GpuFixBuffer('float32', 200)
  .generate((i) => i * 0.03);

const data1 = new GpuFixBuffer('float32', 200)
  .generate((i) => Generators.generateSin(i));

// generate series data
const series1 = new SeriesPoint(time, data1)
    .setColor(Color.blue)
    .setPointSize(5);

numPoints.value = data1.count;

// scales define the range that is shown by the axis
const scaleX = new Scale(0, 3);
const scaleY = new Scale(0, 25);

// handel events
const eventDispatcher = new EventDispatcher();

// define layout
const baseContainer = new LayoutCell();

// use a basic chart layout for arranging the chart-elements
const basicLayout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
basicLayout.addYScale(scaleY, 'Value');
basicLayout.xAxis.label?.setText('Time');

const chartCell = basicLayout.chartCell;

// add event handler to listen for mouse move in chart
eventDispatcher.on(EventTypes.MouseMove, chartCell, (e, chartArea) => {
    const position = e.position;

    // Set the value of the data1 to the value-position of the mouse
    if ((position == null) || (chartArea == null)) {
      return;
    }

    if (!chartArea.contains(position)) {
        // this mouse is not inside the given area
        return;
    }

    // find the x-index of the mouse position in the time data
    const timeValue = scaleX.valueAt(chartArea.left, position.x, chartArea.right);
    const timeIndex = time.findIndex(timeValue);
    if (timeIndex < 0) {
      return;
    }

    // scale mouse y-position to chart-scale-value
    const mouseValueY = scaleY.valueAt(chartArea.bottom, position.y, chartArea.top);

    // update the chart data
    data1.setComponentAt(timeIndex, 0, mouseValueY);
});

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

</script>

<template>
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
</style>