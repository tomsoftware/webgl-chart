<script setup lang="ts">
import { Chart, ChartConfig } from '@tomsoftware/webgl-chart-vue';
import { GpuText, LayoutCell, VerticalLayout, Alignment, Color, LayoutBorder } from '@tomsoftware/webgl-lib';

// define layout
const baseContainer = new LayoutCell();
const vertical = baseContainer.addLayout(new VerticalLayout());

const topCell = vertical.addRelativeCell(1);
const bottomCell = vertical.addRelativeCell(1);

const topBorder = new LayoutBorder(Color.blue);
const bottomBorder = new LayoutBorder(Color.red);

const topText = new GpuText('Top', undefined, Color.black);
const bottomText = new GpuText('Bottom', undefined, Color.black);

// set render callback
const chartData = new ChartConfig()
  .setRenderCallback((context) => {
    context.calculateLayout(baseContainer);

    // draw top cell
    topBorder.draw(context, topCell);
    topText.draw(context, topCell, Alignment.centerCenter);

    // draw bottom cell
    bottomBorder.draw(context, bottomCell);
    bottomText.draw(context, bottomCell, Alignment.centerCenter);
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