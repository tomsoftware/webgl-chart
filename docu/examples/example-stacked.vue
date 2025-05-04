<script setup lang="ts">

import { Generators } from './generators';

import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { Series, GpuFloatBuffer, LayoutCell,
  Color, Scale, EventDispatcher, BasicChartLayout,
  VerticalLayout,
  ScreenPosition,
  Context} from '@tomsoftware/webgl-chart';

class ChartInfo {
  public series: Series;
  public layout: BasicChartLayout;
  public layoutCell: LayoutCell;

  constructor(series: Series, baseContainer: VerticalLayout, showXAxisLabel: boolean = false) {
    this.series = series;

    // second item for the chart
    this.layoutCell = baseContainer.addRelativeCell(1);

    // use a basic chart layout for arranging the chart-elements
    const layout = new BasicChartLayout(eventDispatcher, this.layoutCell, scaleX);
    layout.addYScale(scaleY, 'Value');
    layout.setXAxisLabel(showXAxisLabel ? 'Time' : null);
    this.layout = layout;
  }

  public draw(context: Context, scaleX: Scale, scaleY: Scale) {
    this.layout.draw(context);
    this.series.drawLines(context, scaleX, scaleY, this.layout.chartCell);
  }
}

// generate time data
const itemCount = 1000 * 60 * 60 / 4;
const time = new GpuFloatBuffer(itemCount)
    .generate((i) => i * 0.001); // in seconds

// generate series data
const series1 = new Series(time)
    .generate((t) => Generators.generateSin(t))
    .setColor(Color.blue)
    .setPointSize(5);

const series2 = new Series(time)
    .generate((t) => Generators.generateEKG(t * 10) * 10)
    .setColor(Color.red)
    .setPointSize(4)

const series3 = new Series(time)
    .generate((t) => Generators.generateIO(t * 10) * 20)
    .setColor(Color.darkGreen)
    .setPointSize(4)


// scales define the range that is shown by the axis
const scaleX = new Scale(0, 1);
const scaleY = new Scale(-15, 25);

// handel events
const eventDispatcher = new EventDispatcher();

// define layout
const baseContainer = new LayoutCell();


// add a vertical layout-container with some padding
const baseRow = baseContainer.addLayout(new VerticalLayout(ScreenPosition.fromPixel(10)));

const chartList: ChartInfo [] = [
  new ChartInfo(series1, baseRow, false),
  new ChartInfo(series2, baseRow, false),
  new ChartInfo(series3, baseRow, true)
]


// set render callback: here you need to define what elements you want to draw
const myChart = new ChartConfig()
    .setRenderCallback((context) => {

      // arrange layout
      context.calculateLayout(baseContainer);

      // process events
      eventDispatcher.dispatch(context);

      for (const c of chartList) {
        c.draw(context, scaleX, scaleY);
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
  width: 100%;
  background-color: white;
}

</style>