<script setup lang="ts">
import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { onMounted, ref } from 'vue';
import { LayoutCell, Color, EventDispatcher, GpuFixBuffer } from '@tomsoftware/webgl-lib';
import {SeriesPoint, BasicChartLayout, Scale, DownsamplingMinMaxBin, UniformSampler, SeriesArea,
  } from '@tomsoftware/webgl-chart';

// generate data
const N = 25_000_000;
const xMax = 20_000_000;

const x = new GpuFixBuffer('float32', N)
const y1 = new GpuFixBuffer('float32', N);

function createData() {
  // handle in promise to make it 
  new Promise(resolve => {
    const v = 1 / (N - 1) * xMax;
    x.generate((i) => i * v);

    y1.generate((i) => {
        const t = i * v;
        return 0.2 * Math.cos(t * 0.000002) +
              0.4 * Math.cos(t * 0.0003) +
              0.3 * Math.cos(t * 0.0011) +
              0.1 * (Math.random() - 0.5);
    });

    needsDownsampling = true;
    resolve(0);
  });
}

// define data processing
const downsamplingMinMaxBinX = new UniformSampler('float32', x, 2000);
const downsamplingMinMaxBinY1 = new DownsamplingMinMaxBin('float32', y1, 2000);

// generate series data
const seriesY1_min = new SeriesPoint(downsamplingMinMaxBinX.result, downsamplingMinMaxBinY1.minValues)
    .setColor(Color.black)
    .setPointSize(1);

const seriesY1_max = new SeriesPoint(downsamplingMinMaxBinX.result, downsamplingMinMaxBinY1.maxValues)
    .setColor(Color.black)
    .setPointSize(1);

const seriesArea1 = new SeriesArea(downsamplingMinMaxBinX.result, downsamplingMinMaxBinY1.minValues, downsamplingMinMaxBinY1.maxValues)
  .setColor(Color.blue, Color.lightBlue);

// scales define the range that is shown by the axis
const scaleX = new Scale(0, xMax);
const scaleY = new Scale(-1.4, 1.4);

// handel events
const eventDispatcher = new EventDispatcher();

// define layout
const baseContainer = new LayoutCell();

// use a basic chart layout for arranging the chart-elements
const basicLayout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
basicLayout.addYScale(scaleY, 'Value');
basicLayout.xAxis.label?.setText('Time');

let needsDownsampling = true;

// UI indicators
const totalPoints = ref(0);
const displayedPoints = ref(0);

function processDownSampling(scale: Scale, pixelWidth: number) {
  const result = downsamplingMinMaxBinX.process(scale.min, scale.max, pixelWidth /* reduce to plotted pixel width */);
  downsamplingMinMaxBinY1.process(result.indexes);

  // update UI indicator: each bin produces a min and a max point
  displayedPoints.value = downsamplingMinMaxBinY1.minValues.count + downsamplingMinMaxBinY1.maxValues.count;
  totalPoints.value = y1.count;
}

scaleX.on('changed', () => {
  needsDownsampling = true;
});

// set render callback: here you need to define what elements you want to draw
const myChart = new ChartConfig()
  .setRenderCallback((context) => {

    // arrange layout
    context.calculateLayout(baseContainer);

    // process events
    eventDispatcher.dispatch(context);

    // process downsampling when layout/scale changed
    if (needsDownsampling) {
      const area = basicLayout.chartCell.getArea(context.layoutCache);
      const pixelWidth = Math.max(1, Math.floor(area.width * context.width));
      processDownSampling(scaleX, pixelWidth);
      needsDownsampling = false;
    }

    // draw elements of chart-layout
    basicLayout.draw(context);

    // draw the series
    seriesArea1.draw(context, scaleX, scaleY, basicLayout.chartCell);
    seriesY1_min.draw(context, scaleX, scaleY, basicLayout.chartCell);
    seriesY1_max.draw(context, scaleX, scaleY, basicLayout.chartCell);
  });

function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element)
}

// manage chart options
myChart.setMaxFrameRate(12);

onMounted(() => {
  createData();
});


</script>

<template>
  <div class="chart-header">
    <div class="chart-label">Total data points: {{ new Intl.NumberFormat().format(totalPoints) }}</div>
    <div class="chart-label">Number of displayed points (after downsampling): {{ displayedPoints }}</div>
  </div>

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

.chart-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem 0;
}

.chart-label {
  font-size: 0.9rem;
  color: #333;
}

</style>