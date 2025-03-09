<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { GpuChart } from '@tomsoftware/webgl-chart';
import { ChartConfig } from './chart-config';

interface Props {
  data: ChartConfig
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const props = defineProps<Props>();

const chartCanvas = ref<HTMLCanvasElement>();
const emit = defineEmits<{
  onBind: [element: HTMLElement]
}>();

const gpuChart = new GpuChart();

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

  console.debug('webgl-chart mounted');

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

onBeforeUnmount(() => {
  console.debug('webgl-chart unmounted!');
  gpuChart.dispose();
});

</script>

<template>
  <canvas
    ref="chartCanvas"
    role="img"
    :aria-label="props.ariaLabel"
    :aria-describedby="props.ariaDescribedBy"
  ></canvas>
</template>

