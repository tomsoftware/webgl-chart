<script setup lang="ts">
import { Generators } from './generators';

import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { Series, GpuFloatBuffer, LayoutCell,
  Color, Scale, EventDispatcher, BasicChartLayout,
  TooltipLine, TooltipMarkers} from '@tomsoftware/webgl-chart';

// define ToolTip
const tooltipLine = new TooltipLine()
  .setMouseColor(Color.gray)
  .showMouseLines(true, true);

const tooltipMarkers = new TooltipMarkers()
  .setLineColor(Color.black)
  .showLine(true);


// generate time data
const itemCount = 10 * 60 * 60 / 4;
const time = new GpuFloatBuffer(itemCount)
    .generate((i) => i * 0.001); // in seconds

// generate series data
const data1 = GpuFloatBuffer.generateFrom(time, (t) => Generators.generateSin(t));
const series1 = new Series(time, data1)
    .setColor(Color.blue)
    .setPointSize(5);

const data2 = GpuFloatBuffer.generateFrom(time, (t) => Generators.generateEKG(t * 10) * 10);
const series2 = new Series(time, data2)
    .setColor(Color.red)
    .setPointSize(4)

const data3 = GpuFloatBuffer.generateFrom(time, (t) => Generators.generateIO(t * 10) * 20);
const series3 = new Series(time, data3)
    .setColor(Color.darkGreen)
    .setPointSize(4)

// scales define the range that is shown by the axis
const scaleX = new Scale(0, 0.2);
const scaleY = new Scale(-15, 25);

// handel events
const eventDispatcher = new EventDispatcher();

// define layout
const baseContainer = new LayoutCell();

// use a basic chart layout for arranging the chart-elements
const basicLayout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
basicLayout.addYScale(scaleY, 'Value');
basicLayout.xAxis.label?.setText('Time');

// define series to show markers for
tooltipMarkers.clearSeries();
tooltipMarkers.addSeries(time, data1, scaleX, scaleY, series1.color);
tooltipMarkers.addSeries(time, data2, scaleX, scaleY, series2.color);
tooltipMarkers.addSeries(time, data3, scaleX, scaleY, series3.color);

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
      series3.drawLines(context, scaleX, scaleY, basicLayout.chartCell);
      series2.drawPoints(context, scaleX, scaleY, basicLayout.chartCell);

      // get position of mouse
      const mousePosition = eventDispatcher.getMousePosition();

      if (mousePosition != null) {
        // draw the tooltip mouse line
        tooltipLine.draw(context, mousePosition, basicLayout.chartCell);
        // draw the tooltip marker with the text
        tooltipMarkers.draw(context, mousePosition, basicLayout.chartCell);
      }

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
  height: 300px;
  background-color: white;
}

</style>