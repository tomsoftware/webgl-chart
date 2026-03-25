<script setup lang="ts">
import { Chart, ChartConfig } from '@tomsoftware/webgl-chart-vue';
import { GpuFloatBuffer, LayoutCell, Color, EventDispatcher } from '@tomsoftware/webgl-lib';
import { Scale, BasicChartLayout, SeriesBar, AxisBase } from '@tomsoftware/webgl-chart';
import { ref } from 'vue';

// Sample data
const xData = new GpuFloatBuffer([1, 2, 3, 4, 5]);
const yData = new GpuFloatBuffer([10, 25, 40, 60, 80]);

// Create series
const barSeries = new SeriesBar(xData, yData)
    .setColor(Color.lightBlue);

// Scales
const scaleX = new Scale(0, 6); // displays until start Sep
const scaleY = new Scale(0, 100);

// Layout
const baseContainer = new LayoutCell();
const eventDispatcher = new EventDispatcher();
const basicLayout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
basicLayout.addYScale(scaleY, 'Value');

// Format options
const formatOptions = [
  { name: 'Default', func: AxisBase.defaultFormatTickLabel },
  { name: 'Percentage', func: (value: number) => `${value}%` },
  { name: 'Currency', func: (value: number) => `$${value.toFixed(2)}` },
  { name: 'Scientific', func: (value: number) => value.toExponential(2) },
  { name: 'Date', func: (value: number) => {
    const day = Math.floor(value);
    const fraction = value - day;
    if (fraction != 0) {
        // ignore sub-day-tick-labels
        return '';
    }
    const date = new Date(2024, 0, day); // start at january

    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }
  }
];

const currentFormat = ref(0);

// Update axis format (for x-axis and y-axis matching for ease)
function updateFormat() {
  basicLayout.xAxis.setTickFormat(formatOptions[currentFormat.value].func);
  basicLayout.firstYAxis.axis.setTickFormat(formatOptions[currentFormat.value].func);
}

// Initial format
updateFormat();

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
    <label>Tick Format:</label>
    <select v-model.number="currentFormat" @change="updateFormat">
      <option v-for="(option, index) in formatOptions" :key="index" :value="index">
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