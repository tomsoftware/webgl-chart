<script setup lang="ts">
import { Chart, ChartConfig } from '@tomsoftware/webgl-chart-vue';
import { LayoutCell, Color, EventDispatcher, GpuRingBuffer, GpuFixBuffer } from '@tomsoftware/webgl-lib';
import { SeriesLine, BasicChartLayout, Scale } from '@tomsoftware/webgl-chart';
import { PausableTimer } from './pausable-timer';
import { ref, watch } from 'vue';

// Animation toggle
let pauseAnimation = ref<boolean>(true);

// Three ring buffers with different wrapping behavior
const timeA = new GpuRingBuffer('float32', 100);
const dataBad = new GpuRingBuffer('float32', 100)
  .setBreakAfterWritePosition(true);
const seriesBad = new SeriesLine(timeA, dataBad)
  .setColor(Color.red)
  .setThickness(2);

// using setCopyLastValueToBeginning
const timeCopyLast = new GpuRingBuffer('float32', 100)
  .setCopyLastValueToBeginning(true)
const dataCopyLast = new GpuRingBuffer('float32', 100)
  .setBreakAfterWritePosition(true)
  .setCopyLastValueToBeginning(true)
const seriesCopyLast = new SeriesLine(timeCopyLast, dataCopyLast)
  .setColor(Color.green)
  .setThickness(2);

// using Line-Loop
const dataLineLoop = new GpuRingBuffer('float32', 100)
  .setBreakAfterWritePosition(true);
const seriesLineLoop = new SeriesLine(timeA, dataLineLoop)
  .setColor(Color.blue)
  .setThickness(2)
  .setLineLoop(true); // enable "web-gl line-loop" for this line

// Scales
const scaleX = new Scale(0, 11);
const scaleY = new Scale(0, 7);

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
  seriesLineLoop.draw(context, scaleX, scaleY, layout.chartCell);
  seriesCopyLast.draw(context, scaleX, scaleY, layout.chartCell);
  seriesBad.draw(context, scaleX, scaleY, layout.chartCell);
});

myChart.setMaxFrameRate(12);

// Bind DOM element
function onBind(el: HTMLElement | null) {
  eventDispatcher.bind(el);
}

// Timer: push new values
const timer = new PausableTimer((t) => {
  const v = Math.sin(t);

  timeA.push(t);
  timeCopyLast.push(t);

  dataBad.push(v + 5.5);
  dataCopyLast.push(v + 3.5);
  dataLineLoop.push(v + 1.5);

  // update scale, having 4% padding on scales
  const padding = scaleX.range * 0.04;
  scaleX.max = Math.max(scaleX.max, t + padding * 2);
  scaleX.min = (timeA.getComponentAt(0) ?? 0) - padding;

}, 100, !pauseAnimation.value);

// simulate 150 data points
timer.trigger(150);

// Pause toggle
watch(pauseAnimation, (value) => timer.enable(!value));

/** reset the chart data */
function clearData() {
  timeA.clear();
  timeCopyLast.clear();
  dataLineLoop.clear();
  dataCopyLast.clear();
  dataBad.clear();
  timer.reset();
  scaleX.max = 11;
  scaleX.min = 0;
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
    <div><span class="red"></span>with gap</div>
    <div><span class="green"></span>copyLastValueToBeginning</div>
    <div><span class="blue"></span>SeriesLine.lineLoop</div>
    
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
.green { background: green; }
.red { background: red; }

button {
  margin: 0 10px 2px 0;
  width: 70px;
}
</style>
