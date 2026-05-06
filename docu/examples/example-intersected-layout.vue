<script setup lang="ts">
import { Chart, ChartConfig } from '@tomsoftware/webgl-chart-vue';
import { GpuText, LayoutCell, HorizontalLayout, VerticalLayout, IntersectedLayout,
  Alignment, Color, LayoutBorder } from '@tomsoftware/webgl-lib';

// define layout
const baseContainer = new LayoutCell();

const horizontal = baseContainer.addLayout(new HorizontalLayout());
const leftCell = horizontal.addRelativeCell(1);
const rightCell = horizontal.addRelativeCell(1);

const vertical = baseContainer.addLayout(new VerticalLayout());
const topCell = vertical.addRelativeCell(1);
const bottomCell = vertical.addRelativeCell(1);

const intersection = baseContainer.addLayout(new IntersectedLayout(leftCell, topCell));

const borderLeft = new LayoutBorder(Color.green);
const borderRight = new LayoutBorder(Color.blue);
const borderTop = new LayoutBorder(Color.orange);
const borderBottom = new LayoutBorder(Color.purple);
const borderIntersection = new LayoutBorder(Color.red);

const textLeft = new GpuText('Left', undefined, Color.black);
const textRight = new GpuText('Right', undefined, Color.black);
const textTop = new GpuText('Top', undefined, Color.black);
const textBottom = new GpuText('Bottom', undefined, Color.black);
const textIntersection = new GpuText('Intersect', undefined, Color.red);

// set render callback
const chartData = new ChartConfig()
  .setRenderCallback((context) => {
    context.calculateLayout(baseContainer);

    borderLeft.draw(context, leftCell);
    textLeft.draw(context, leftCell, Alignment.leftCenter);

    borderRight.draw(context, rightCell);
    textRight.draw(context, rightCell, Alignment.rightCenter);

    borderTop.draw(context, topCell);
    textTop.draw(context, topCell, Alignment.centerTop);

    borderBottom.draw(context, bottomCell);
    textBottom.draw(context, bottomCell, Alignment.centerBottom);

    borderIntersection.draw(context, intersection);
    textIntersection.draw(context, intersection, Alignment.centerCenter);
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
  padding: 10px;
}
</style>