<script setup lang="ts">
import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { GpuText, LayoutCell, Alignment, LayoutBorder, Color } from '@tomsoftware/webgl-chart';

const leftTop = new GpuText('top left', undefined, Color.red);
const leftCenter = new GpuText('center left', undefined, Color.red);
const leftBottom = new GpuText('bottom left', undefined, Color.red);

const centerTop = new GpuText('top center', undefined, Color.red);
const centerCenter = new GpuText('center center', undefined, Color.red);
const centerBottom = new GpuText('bottom center', undefined, Color.red);

const rightTop = new GpuText('top right', undefined, Color.red);
const rightCenter = new GpuText('center right', undefined, Color.red);
const rightBottom = new GpuText('bottom right', undefined, Color.red);

// define layout
const baseContainer = new LayoutCell();

const border = new LayoutBorder(Color.green);

// set render callback
const chartData = new ChartConfig()
    .setRenderCallback((context) => {
      context.calculateLayout(baseContainer);

      // draw border around the container
      border.draw(context, baseContainer);

      leftTop.draw(context, baseContainer, Alignment.leftTop);
      leftCenter.draw(context, baseContainer, Alignment.leftCenter);
      leftBottom.draw(context, baseContainer, Alignment.leftBottom);

      centerTop.draw(context, baseContainer, Alignment.centerTop);
      centerCenter.draw(context, baseContainer, Alignment.centerCenter);
      centerBottom.draw(context, baseContainer, Alignment.centerBottom);

      rightTop.draw(context, baseContainer, Alignment.rightTop);
      rightCenter.draw(context, baseContainer, Alignment.rightCenter);
      rightBottom.draw(context, baseContainer, Alignment.rightBottom);
  });

</script>

<template>
  <chart
    :data="chartData"
    class="chart"
  />
</template>

