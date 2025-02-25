<script setup lang="ts">
import { Chart, ChartConfig } from '@tomsoftware/webgl-chart-vue'
import { Color, EventDispatcher, GpuFloatBuffer, LayoutCell, Scale, Series } from '@tomsoftware/webgl-chart'

const eventDispatcher = new EventDispatcher();

const baseContainer = new LayoutCell();
const scaleX = new Scale(0, 10);
const scaleY = new Scale(-30, 30);

// generate time data
const itemCount = 1000 * 60 * 60 / 4;

const time = new GpuFloatBuffer(itemCount)
    .generate((i) => i * 0.001); // in seconds

// generate series data
const series1 = new Series(time, null)
    .generate((t) => 10 + Math.sin(t * 2 * Math.PI) * 10 + Math.random() * 2)
    .setColor(Color.blue)
    .setPointSize(5);

function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element)
}


const data1 = new ChartConfig()
    .setRenderCallback((context) => {
      context.calculateLayout(baseContainer);

      // draw
      series1.drawPoints(context, scaleX, scaleY, baseContainer);

  });

</script>

<template>
  <main>
    <Chart
      class="chart"
      :data="data1"
      @on-bind="onBind"
    />
  </main>
</template>

<style scoped>

.chart {
  height: 100%;
  width: 100%;
  position: relative;
}

</style>
