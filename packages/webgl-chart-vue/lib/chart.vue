<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { ChartConfig } from './chart-config';
import { WebGlChart } from '@tomsoftware/webgl-chart';


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

const webGlChart = new WebGlChart();

watch(
  () => props.data.maxFrameRate.value,
  (newValue) => {
    webGlChart.setMaxFrameRate(newValue);
  }
);

onMounted(() => {
  const cav = chartCanvas.value;
  if (cav == null) {
    return;
  }

  console.debug('webgl-chart mounted');

  webGlChart.bind(cav);
  webGlChart.setMaxFrameRate(props.data.maxFrameRate.value);
  webGlChart.setRenderCallback((context) => {
    if ((props.data == null) || ((props.data.onRender == null))) {
      return;
    }
    props.data.onRender(context)
  });

  emit('onBind', cav);

  webGlChart.render();
});

onBeforeUnmount(() => {
  console.debug('webgl-chart unmounted!');
  webGlChart.dispose();
});

defineExpose({ WebGlChart: webGlChart });

</script>

<template>
  <canvas
    ref="chartCanvas"
    role="img"
    :aria-label="props.ariaLabel"
    :aria-describedby="props.ariaDescribedBy"
  ></canvas>
</template>

