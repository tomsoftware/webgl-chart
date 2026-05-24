<script setup lang="ts">
import { Chart, ChartConfig } from '@tomsoftware/webgl-chart-vue';
import { onMounted, ref } from 'vue';
import { LayoutCell, Color, EventDispatcher, GpuFixBuffer } from '@tomsoftware/webgl-lib';
import { SeriesPoint, BasicChartLayout, Scale, DownsamplingMinMaxBin, UniformSampler, SeriesArea } from '@tomsoftware/webgl-chart';

const N = 10_000_000;
const xMax = 20_000_000;

const isLoading = ref(true);
const totalPoints = ref(0);
const displayedPoints = ref(0);
let myChart: ChartConfig | null = null;

let downsamplingMinMaxBinX: UniformSampler<Float32Array> | null = null;
let downsamplingMinMaxBinY1: DownsamplingMinMaxBin<Float32Array> | null = null;
let seriesY1_min: SeriesPoint | null = null;
let seriesY1_max: SeriesPoint | null = null;
let seriesArea1: SeriesArea | null = null;

const scaleX = new Scale(0, xMax);
const scaleY = new Scale(-1.4, 1.4);
const eventDispatcher = new EventDispatcher();
const baseContainer = new LayoutCell();
const basicLayout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
basicLayout.addYScale(scaleY, 'Value');
basicLayout.xAxis.label?.setText('Time');

let needsDownsampling = true;

async function createData() {
  await new Promise((resolve) => setTimeout(resolve, 0));

  const x = new GpuFixBuffer('float32', N);
  const y1 = new GpuFixBuffer('float32', N);
  const chunkSize = 100_000;

  for (let start = 0; start < N; start += chunkSize) {
    const end = Math.min(N, start + chunkSize);

    for (let i = start; i < end; i++) {
      const xValue = (i / (N - 1)) * xMax;
      const yValue = 0.2 * Math.cos(i * 0.000002) +
        0.4 * Math.cos(i * 0.0003) +
        0.3 * Math.cos(i * 0.0011) +
        0.1 * (Math.random() - 0.5);

      x.push(xValue);
      y1.push(yValue);
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  totalPoints.value = x.count;

  downsamplingMinMaxBinX = new UniformSampler<Float32Array>('float32', x, 2000);
  downsamplingMinMaxBinY1 = new DownsamplingMinMaxBin<Float32Array>('float32', y1, 2000);

  seriesY1_min = new SeriesPoint(downsamplingMinMaxBinX.result, downsamplingMinMaxBinY1.minValues)
    .setColor(Color.black)
    .setPointSize(1);

  seriesY1_max = new SeriesPoint(downsamplingMinMaxBinX.result, downsamplingMinMaxBinY1.maxValues)
    .setColor(Color.black)
    .setPointSize(1);

  seriesArea1 = new SeriesArea(downsamplingMinMaxBinX.result, downsamplingMinMaxBinY1.minValues, downsamplingMinMaxBinY1.maxValues)
    .setColor(Color.blue, Color.lightBlue);

  myChart = new ChartConfig()
    .setRenderCallback((context) => {
      if (!downsamplingMinMaxBinX || !downsamplingMinMaxBinY1 || !seriesArea1 || !seriesY1_min || !seriesY1_max) {
        return;
      }

      context.calculateLayout(baseContainer);
      eventDispatcher.dispatch(context);

      if (needsDownsampling) {
        const area = basicLayout.chartCell.getArea(context.layoutCache);
        const pixelWidth = Math.max(1, Math.floor(area.width * context.width));
        processDownSampling(scaleX, pixelWidth);
        needsDownsampling = false;
      }

      basicLayout.draw(context);
      seriesArea1.draw(context, scaleX, scaleY, basicLayout.chartCell);
      seriesY1_min.draw(context, scaleX, scaleY, basicLayout.chartCell);
      seriesY1_max.draw(context, scaleX, scaleY, basicLayout.chartCell);
    });

  isLoading.value = false;
}

function processDownSampling(scale: Scale, pixelWidth: number) {
  if (!downsamplingMinMaxBinX || !downsamplingMinMaxBinY1) {
    return;
  }

  const result = downsamplingMinMaxBinX.process(scale.min, scale.max, pixelWidth /* reduce to plotted pixel width */);
  downsamplingMinMaxBinY1.process(result.indexes);
  displayedPoints.value = downsamplingMinMaxBinY1.minValues.count + downsamplingMinMaxBinY1.maxValues.count;
}

scaleX.on('changed', () => {
  needsDownsampling = true;
});

onMounted(() => {
  createData();
});

function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element);
}
</script>

<template>
  <div v-if="isLoading" class="chart-loading">
    Please wait, creating data...
  </div>

  <div v-else>
    <div class="chart-header">
      <div class="chart-label">Total data points: {{ new Intl.NumberFormat().format(totalPoints) }}</div>
      <div class="chart-label">Displayed points after downsampling: {{ displayedPoints }}</div>
    </div>

    <chart
      v-if="myChart"
      :data="myChart"
      @on-bind="onBind"
      class="chart"
    />
  </div>
</template>

<style scoped>
.chart {
  width: 100%;
  background-color: white;
}

.chart-loading {
  padding: 1rem;
  font-size: 1rem;
  color: #333;
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
