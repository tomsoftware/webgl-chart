<script setup lang="ts">

import { onBeforeUnmount, onMounted, ref } from 'vue';

import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { Series, Matrix3x3, GpuFloatBuffer,
GpuText, LayoutCell, VerticalAxis,
HorizontalAxis, HorizontalAxisPosition , VerticalLayout,
HorizontalLayout, ScreenPosition, IntersectedLayout,
LayoutBorder, Color, Alignment, Scale,
EventDispatcher, EventTypes, RectDrawer} from '@tomsoftware/webgl-chart';
import { Generators } from './generators';


const eventDispatcher = new EventDispatcher();

const scaleX = new Scale(0, 1);
const scaleY = new Scale(-15, 25);

// generate time data
const itemCount = 1000 * 60 * 60 / 4;

const time = new GpuFloatBuffer(itemCount)
    .generate((i) => i * 0.001); // in seconds




// generate series data
const series1 = new Series(time, null)
    .generate((t) => 10 + Math.sin(t * 2 * Math.PI) * 10 + Math.random() * 2)
    .setColor(Color.blue)
    .setPointSize(5);

const series2 = new Series(time, null)
    .generate((t) => Generators.generateEKG(t * 10) * 10)
    .setColor(Color.red)
    .setPointSize(4)

const series3 = new Series(time, null)
    .generate((t) => Generators.iOSimulation(t * 10) * 20)
    .setColor(Color.darkGreen)
    .setPointSize(4)



// define axis
const xAxis = new HorizontalAxis(new GpuText('Time'), scaleX)
  .setBorderColor(Color.darkGray)
  .setPosition(HorizontalAxisPosition.Bottom)
  .setGridColor(Color.lightGray);

const yAxis1 = new VerticalAxis(new GpuText('Value').setRotation(90), scaleY);

const headline = new GpuText('My new Chart');


// define layout
const baseContainer = new LayoutCell();
const baseRow = baseContainer.addLayout(new VerticalLayout(ScreenPosition.FromPixel(10)));

const headlineLayout = baseRow.addFixedCell([headline]);
const innerContainer = baseRow.addCell(1);

// horizontal layout for y axis and chart-data
const column = innerContainer.addLayout(new HorizontalLayout());
const columnAxis1CellLeft = column.addFixedCell(yAxis1);

const columnChartCell = column.addCell(1); // 100% of empty space


// vertical layout for x axis and chart-data
const row = innerContainer.addLayout(new VerticalLayout());
const rowChartCell = row.addCell(1); // 100% of empty space
const rowAxisCell = row.addFixedCell([xAxis]);

// const chartCell = innerContainer.addLayout(new IntersectedLayout(rowChartCell, columnChartCell));
const xAxisCell = innerContainer.addLayout(new IntersectedLayout(rowAxisCell, columnChartCell));
const yAxis1Cell = innerContainer.addLayout(new IntersectedLayout(columnAxis1CellLeft, rowChartCell));

const chartCell = innerContainer.addLayout(new IntersectedLayout(columnChartCell, rowChartCell));


const chartBorder = new LayoutBorder(Color.green);

console.log('itemCount: ', itemCount);


eventDispatcher.on(EventTypes.Wheel, columnChartCell, (event) => {
  scaleX.zoom(0.2 * Math.sign(event.wheelDelta));
});

eventDispatcher.on(EventTypes.Pan, columnChartCell, (event, _layoutNode, area) => {
  scaleX.pan(event.panDeltaX / area.width);
});


eventDispatcher.on(EventTypes.Wheel, yAxis1Cell, (event) => {
  scaleY.zoom(0.2 * Math.sign(event.wheelDelta));
});

eventDispatcher.on(EventTypes.Pan, yAxis1Cell, (event, _layoutNode, area) => {
  scaleY.pan(- event.panDeltaY / area.height);
});


const rec = new RectDrawer();


// set render callback
const data1 = new ChartConfig()
    .setRenderCallback((context) => {

      context.calculateLayout(baseContainer);

      eventDispatcher.dispatch(context);


      headline.draw(context, headlineLayout, Alignment.centerCenter, new Matrix3x3());

      xAxis.draw(context, xAxisCell, chartCell);
      yAxis1.draw(context, yAxis1Cell);

      // flush lines and textures
      context.flush();

      // draw the series
      series1.setThickness(1).drawLines(context, scaleX, scaleY, chartCell);
      series2.drawLines(context, scaleX, scaleY, chartCell);
      series3.drawLines(context, scaleX, scaleY, chartCell);
  });

function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element)
}
data1.maxFrameRate.value = 12;

// animation
let animationTimer: number = 0;
onMounted(() => {
  animationTimer = window.setInterval(() => {
    scaleX.pan(-0.01);
  }, 100);
});

onBeforeUnmount(() => {
  window.clearInterval(animationTimer);
});

</script>

<template>

 <div class="grid-container">
  <div class="grid-item">
    <chart
      :data="data1"
      @on-bind="onBind"
      class="chart"
    />
  </div>
</div>

</template>

<style scoped>
.chart {
  height: 300px;
}

.grid-container {
  display: grid;
  width: 100%;
  height: 300px;
  column-count: 2;
  overflow: hidden;
  padding: 0;
  margin: 0;
  background-color: white;
}
.grid-item {
  padding: 0;
  margin: 0;
}
</style>