<script setup lang="ts">
import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { LayoutCell, Color, EventDispatcher, GpuFixBuffer } from '@tomsoftware/webgl-lib';
import {SeriesPoint, BasicChartLayout, Scale, DownsamplingMinMaxBin, UniformSampler,
  } from '@tomsoftware/webgl-chart';

// generate data
const N = 50_000_000;
const xMax = 2_000_000;

const itemCount = 10 * 1000 * 1000; // nanoseconds;
const x = new GpuFixBuffer('float32', itemCount)
    .generate((i) =>  (i / (N - 1)) * xMax );

const y1 = GpuFixBuffer.generateFrom('float32', x, (i) => {
    return 0.6 * Math.sin(i * 0.0003) +
    0.3 * Math.sin(i * 0.0011) +
    0.1 * (Math.random() - 0.5);
});

// define data processing
const downsamplingMinMaxBinX = new UniformSampler(x);
const downsamplingMinMaxBinY1 = new DownsamplingMinMaxBin(y1);


// generate series data
const seriesY1_min = new SeriesPoint(downsamplingMinMaxBinX.result, downsamplingMinMaxBinY1.minValues)
    .setColor(Color.black)
    .setPointSize(1);

const seriesY1_max = new SeriesPoint(downsamplingMinMaxBinX.result, downsamplingMinMaxBinY1.maxValues)
    .setColor(Color.black)
    .setPointSize(1);



// scales define the range that is shown by the axis
const scaleX = new Scale(0, xMax);
const scaleY = new Scale(0, 1);

// handel events
const eventDispatcher = new EventDispatcher();

// define layout
const baseContainer = new LayoutCell();

// use a basic chart layout for arranging the chart-elements
const basicLayout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
basicLayout.addYScale(scaleY, 'Value');
basicLayout.xAxis.label?.setText('Time');

scaleX.on("changed", (scale) => {
  const result = downsamplingMinMaxBinX.process(scale.min, scale.max, 1000 /* always reduce to 100 points */);
  downsamplingMinMaxBinY1.process(result);
})


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
      seriesY1_min.draw(context, scaleX, scaleY, basicLayout.chartCell);
      seriesY1_max.draw(context, scaleX, scaleY, basicLayout.chartCell);
  });

function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element)
}

// manage chart options
myChart.setMaxFrameRate(12);

</script>

<template>
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