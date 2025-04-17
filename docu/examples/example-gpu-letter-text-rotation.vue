<script setup lang="ts">
import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { LayoutCell, Alignment, LayoutBorder, Color, GpuLetterText } from '@tomsoftware/webgl-chart';
import { ref } from 'vue';

const deg = ref<number>(45);

const texts = new Map<Alignment, GpuLetterText>(
  Alignment.list
    .map((key) => [key, new GpuLetterText(key.toString(), undefined, Color.red)])
);

// define layout
const baseContainer = new LayoutCell();

const border = new LayoutBorder(Color.green);

// set render callback
const chartData = new ChartConfig()
    .setRenderCallback((context) => {
      context.calculateLayout(baseContainer);

      // draw border around the container
      border.draw(context, baseContainer);

      for (const [alignment, text] of texts) {
        text.setRotation(deg.value);
        text.draw(context, baseContainer, alignment);
      }

  });
  chartData.setMaxFrameRate(15);
</script>

<template>
  <input type="range" min="-180" max="180" v-model.number="deg" /> Angle: {{ deg }} °
  <br />
  <chart
    :data="chartData"
    class="chart"
  />
</template>

