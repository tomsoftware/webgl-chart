<script setup lang="ts">
import { Chart, ChartConfig } from '@tomsoftware/webgl-chart-vue';
import { LayoutCell, Color, EventDispatcher, GpuRingBuffer, GpuFixBuffer } from '@tomsoftware/webgl-lib';
import { SeriesLine, BasicChartLayout, Scale } from '@tomsoftware/webgl-chart';
import { PausableTimer } from './pausable-timer';
import { ref, watch } from 'vue';

// Animation toggle
let pauseAnimation = ref<boolean>(true);

// Three ring buffers with different wrapping behavior
const time = new GpuFixBuffer('float32', 100)
  .generate((i) => i * 0.1);

const dataA = new GpuRingBuffer('float32', 100)
  .setBreakAfterWritePosition(false);

const dataB = new GpuRingBuffer('float32', 100)
  .setBreakAfterWritePosition(true);

// Create three line series with Y‑offsets
const seriesA = new SeriesLine(time, dataA)
  .setColor(Color.blue)
  .setThickness(2);

const seriesB = new SeriesLine(time, dataB)
  .setColor(Color.red)
  .setThickness(2);

// Scales
const scaleX = new Scale(-1, 11);
const scaleY = new Scale(-3.5, 3.5);

// Layout + events
const eventDispatcher = new EventDispatcher();
const baseContainer = new LayoutCell();
const layout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
layout.addYScale(scaleY, 'Value');
layout.xAxis.label?.setText('Time');

// Chart config
const myChart = new ChartConfig().setRenderCallback((context) => {
  context.calculateLayout(baseContainer);
  eventDispatcher.dispatch(context);

  layout.draw(context);

  // Draw three lines with Y‑offsets
  seriesA.draw(context, scaleX, scaleY, layout.chartCell);
  seriesB.draw(context, scaleX, scaleY, layout.chartCell);
});

myChart.setMaxFrameRate(12);

// Bind DOM element
function onBind(el: HTMLElement | null) {
  eventDispatcher.bind(el);
}

// Timer: push new values
const timer = new PausableTimer((t) => {
  const v = Math.sin(t);

  // A: normal
  dataA.push(v + 1.5);

  // C: breakAfterWritePosition
  dataB.push(v - 1.5);
}, 100, !pauseAnimation.value);

// simulate 150 data points
timer.trigger(150);

// Pause toggle
watch(pauseAnimation, (value) => timer.enable(!value));

/** reset the chart data */
function clearData() {
  dataA.clear();
  dataB.clear();
  scaleX.min = -1;
  scaleX.max = 11;
}

</script>

<template>
  <button @click="pauseAnimation = !pauseAnimation">
    {{ pauseAnimation ? 'run' : 'pause' }}
  </button>
  <button @click="clearData()">reset</button>

  <chart
    :data="myChart"
    @on-bind="onBind"
    class="chart"
  />

  <div class="legend">
    <div><span class="blue"></span>breakAfterWritePosition = false</div>
    <div><span class="red"></span> breakAfterWritePosition = true</div>
  </div>
</template>

<style scoped>
.chart {
  width: 100%;
  background: white;
  height: 400px;
}

.legend {
  margin-top: 10px;
  display: flex;
  gap: 20px;
}

.legend > div {
  display: flex;
  align-items: center;
}

.legend span {
  width: 20px;
  height: 3px;
  margin-right: 5px;
}

.blue { background: blue; }
.red { background: red; }

button {
  margin: 0 10px 2px 0;
  width: 70px;
}
</style>
