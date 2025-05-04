<script setup lang="ts">
import { Generators } from './generators';

import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { Series, GpuFloatBuffer, LayoutCell,
  Color, Scale, EventDispatcher, BasicChartLayout,
  Annotations,
  GpuText,
  VerticalPosition,
  HorizontalPosition} from '@tomsoftware/webgl-chart';

// generate time data
const itemCount = 1000 * 60 * 60 / 4;
const time = new GpuFloatBuffer(itemCount)
    .generate((i) => i * 0.001); // in seconds

const series1 = new Series(time)
    .generate((t) => Generators.generateIO(t * 10) * 20)
    .setColor(Color.darkGreen)
    .setThickness(1);

// scales define the range that is shown by the axis
const scaleX = new Scale(0, 1);
const scaleY = new Scale(-15, 25);

// handel events
const eventDispatcher = new EventDispatcher();

// define layout
const baseContainer = new LayoutCell();

// use a basic chart layout for arranging the chart-elements
const basicLayout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
basicLayout.addYScale(scaleY, 'Value');
basicLayout.xAxis.label?.setText('Time');

// generate some annotations
const annotations = new Annotations();

// Line annotation
annotations.addVerticalLine(0.3, Color.red, 10, 2)
  .addLabel(new GpuText('red marker'), Color.red, VerticalPosition.Bottom, 10, undefined, 10);

annotations.addVerticalLine(0.6, Color.blue, 0, 2)
  .addLabel(new GpuText('blue marker'), Color.blue, VerticalPosition.Top, undefined, undefined, 10);

annotations.addHorizontalLine(10, Color.green, 5, 2)
  .addLabel(new GpuText('green marker'), Color.green, HorizontalPosition.Center, undefined, undefined, 10);

// Box annotation
annotations.addBox(0.02, 21, 0.16, -2, Color.purple.withAlpha(0.3));

// set render callback: here you need to define what elements you want to draw
const myChart = new ChartConfig()
    .setRenderCallback((context) => {

      // arrange layout
      context.calculateLayout(baseContainer);

      // process events
      eventDispatcher.dispatch(context);

      // draw elements of chart-layout
      basicLayout.draw(context);

      // draw the series
      series1.drawLines(context, scaleX, scaleY, basicLayout.chartCell);
      
      // draw annotations
      annotations.draw(context, scaleX, scaleY, basicLayout.chartCell);

  });

function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element)
}

// manage chart options
myChart.setMaxFrameRate(12);

</script>

<template>
  <chart
    :data="myChart"
    @on-bind="onBind"
    class="chart"
  />
</template>

<style scoped>
.chart {
  width: 100%;
  background-color: white;
}
</style>