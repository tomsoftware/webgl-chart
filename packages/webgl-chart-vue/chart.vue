<script setup lang="ts">
import { ref, onMounted, onBeforeUpdate, watch } from 'vue'
import { GpuChart } from '@tomsoftware/webgl-chart';
import { ChartConfig } from './chart-config';

const chartCanvas = ref<HTMLCanvasElement>();
const emit = defineEmits<{
  onBind: [element: HTMLElement]
}>();

const gpuChart = new GpuChart();

const props = defineProps<{
  data: ChartConfig
}>()

watch(
    () => props.data.maxFrameRate.value,
    (newValue) => {
      gpuChart.setMaxFrameRate(newValue);
    }
);


onMounted(() => {
  const cav = chartCanvas.value;
  if (cav == null) {
    return;
  }

  console.log('mounted', cav);

  gpuChart.bind(cav);
  gpuChart.setMaxFrameRate(props.data.maxFrameRate.value);
  gpuChart.setRenderCallback((context) => {
    if ((props.data == null) || ((props.data.onRender == null))) {
      return;
    }
    props.data.onRender(context)
  });

  emit('onBind', cav);

  gpuChart.render();
});

onBeforeUpdate(() => {
  console.log('unmounted');
});

</script>

<template>
  <div class="chart-container">
    <canvas ref="chartCanvas" class="chart-canvas"></canvas>
  </div>
</template>

<style scoped>

.chart-container {
  width:100%;
  height:100%;

  border: 1px solid red;

  position: relative;
}

.chart-canvas {
  width:100%;
  height:100%;

  border: 1px solid green;

  position: absolute;

}

</style>
