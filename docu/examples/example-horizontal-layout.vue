<script setup lang="ts">
import { Chart, ChartConfig } from '@tomsoftware/webgl-chart-vue';
import { GpuText, LayoutCell, HorizontalLayout, Alignment, Color, LayoutBorder } from '@tomsoftware/webgl-lib';

// define layout
const baseContainer = new LayoutCell();
const horizontal = baseContainer.addLayout(new HorizontalLayout());

const leftCell = horizontal.addRelativeCell(1);
const rightCell = horizontal.addRelativeCell(1);

const leftBorder = new LayoutBorder(Color.darkGreen);
const rightBorder = new LayoutBorder(Color.red);

const leftText = new GpuText('Left', undefined, Color.black);
const rightText = new GpuText('Right', undefined, Color.black);

// set render callback
const chartData = new ChartConfig()
  .setRenderCallback((context) => {
    context.calculateLayout(baseContainer);

    // draw left cell
    leftBorder.draw(context, leftCell);
    leftText.draw(context, leftCell, Alignment.centerCenter);

    // draw right cell
    rightBorder.draw(context, rightCell);
    rightText.draw(context, rightCell, Alignment.centerCenter);
  });
chartData.setMaxFrameRate(15);

</script>

<template>
  <div class="padding">
    <chart
      :data="chartData"
      class="chart"
    />
  </div>

</template>

<style scoped>
.chart {
  background-color: white;
}
.padding {
  background-color: lightgrey;
  padding:10px
}
</style>