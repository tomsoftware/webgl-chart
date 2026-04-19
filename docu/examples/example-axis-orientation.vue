<script setup lang="ts">
import { Chart, ChartConfig } from '@tomsoftware/webgl-chart-vue';
import { GpuGrowingBuffer, LayoutCell, Color, EventDispatcher, GpuText } from '@tomsoftware/webgl-lib';
import { Scale, BasicChartLayout, SeriesBar, HorizontalAxisOrientation, VerticalAxisOrientation } from '@tomsoftware/webgl-chart';
import { ref } from 'vue';

// Sample data
const xData = new GpuGrowingBuffer('float32', [1, 2, 3, 4, 5]);
const yData = new GpuGrowingBuffer('float32', [10, 25, 40, 60, 80]);

// Create series
const barSeries = new SeriesBar(xData, yData).setColor(Color.lightBlue);

// Scales
const scaleX = new Scale(0, 6);
const scaleY = new Scale(0, 100);

// Layout
const baseContainer = new LayoutCell();
const eventDispatcher = new EventDispatcher();
const basicLayout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
basicLayout.addYScale(scaleY, 'Value');

// Position options
const xOrientations = [
  { name: 'Bottom', value: HorizontalAxisOrientation.Bottom },
  { name: 'Top', value: HorizontalAxisOrientation.Top }
];

const yOrientations = [
  { name: 'Left', value: VerticalAxisOrientation.Left },
  { name: 'Right', value: VerticalAxisOrientation.Right }
];

const currentXPos = ref(0);
const currentYPos = ref(0);

// Update positions
function updateOrientations() {
  basicLayout.xAxis.setOrientation(xOrientations[currentXPos.value].value);
  basicLayout.firstYAxis.axis.setOrientation(yOrientations[currentYPos.value].value);
}

// Initial positions
updateOrientations();

// Chart config
const myChart = new ChartConfig()
  .setRenderCallback((context) => {
    context.calculateLayout(baseContainer);
    eventDispatcher.dispatch(context);

    basicLayout.draw(context);
    barSeries.draw(context, scaleX, scaleY, basicLayout.chartCell);
  });

// Bind events
function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element);
}

myChart.setMaxFrameRate(12);
</script>

<template>
  <div>
    <label>X-Axis Orientation:</label>
    <select v-model.number="currentXPos" @change="updateOrientations">
      <option v-for="(option, index) in xOrientations" :key="index" :value="index">
        {{ option.name }}
      </option>
    </select>

    <label>Y-Axis Orientation:</label>
    <select v-model.number="currentYPos" @change="updateOrientations">
      <option v-for="(option, index) in yOrientations" :key="index" :value="index">
        {{ option.name }}
      </option>
    </select>
  </div>
  <br />
  <chart :data="myChart" @on-bind="onBind" class="chart" />
</template>

<style scoped>
.chart {
  width: 100%;
  height: 400px;
  background-color: white;
}
select {
    margin-right: 10px;
    margin-left: 10px;
}
</style>