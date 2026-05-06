<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { ChartConfig } from './chart-config';
import { WebGLRenderer } from '@tomsoftware/webgl-lib';

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

const webGLRenderer = new WebGLRenderer();

watch(
  () => props.data.maxFrameRate.value,
  (newValue) => {
    webGLRenderer.setMaxFrameRate(newValue);
  }
);

onMounted(() => {
  const cav = chartCanvas.value;
  if (cav == null) {
    return;
  }

  console.debug('webgl-chart mounted');

  webGLRenderer.bind(cav);
  webGLRenderer.setMaxFrameRate(props.data.maxFrameRate.value);
  webGLRenderer.setRenderCallback((context) => {
    if ((props.data == null) || ((props.data.onRender == null))) {
      return;
    }
    props.data.onRender(context)
  });

  emit('onBind', cav);

  webGLRenderer.render();
});

onBeforeUnmount(() => {
  console.debug('webgl-chart unmounted!');
  webGLRenderer.dispose();
});

defineExpose({ webGLRenderer });

</script>

<template>
  <canvas
    ref="chartCanvas"
    role="img"
    :aria-label="props.ariaLabel"
    :aria-describedby="props.ariaDescribedBy"
  ></canvas>
</template>

