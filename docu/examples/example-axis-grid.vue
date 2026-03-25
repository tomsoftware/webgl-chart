<script setup lang="ts">
import { Chart, ChartConfig } from '@tomsoftware/webgl-chart-vue';
import { GpuFloatBuffer, LayoutCell, Color, EventDispatcher, GpuText } from '@tomsoftware/webgl-lib';
import { Scale, BasicChartLayout, SeriesBar } from '@tomsoftware/webgl-chart';
import { ref } from 'vue';

// Sample data
const xData = new GpuFloatBuffer([1, 2, 3, 4, 5]);
const yData = new GpuFloatBuffer([10, 25, 40, 60, 80]);

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

// Grid options
const gridOptions = [
  { name: 'No Grid', color: null },
  { name: 'Light Gray Grid', color: Color.lightGray },
  { name: 'Dark Gray Grid', color: Color.gray },
  { name: 'Blue Grid', color: Color.blue.withAlpha(0.3) }
];

const currentGrid = ref(0);

// Update grid
function updateGrid() {
  const color = gridOptions[currentGrid.value].color;
  basicLayout.xAxis.setGridColor(color);
  basicLayout.firstYAxis.axis.setGridColor(color);
}

// Initial grid
updateGrid();

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
    <label>Grid Style:</label>
    <select v-model.number="currentGrid" @change="updateGrid">
      <option v-for="(option, index) in gridOptions" :key="index" :value="index">
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