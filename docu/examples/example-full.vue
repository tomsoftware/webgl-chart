<script setup lang="ts">

import { ref } from 'vue';

import { Chart, Utilities, ChartConfig} from '@tomsoftware/webgl-chart-vue';
import { Series, Matrix3x3, GpuFloatBuffer,
GpuText, LayoutCell, VerticalAxis, VerticalAxisPosition,
HorizontalAxis, HorizontalAxisPosition , VerticalLayout,
HorizontalLayout, ScreenPosition, IntersectedLayout,
LayoutBorder, Color, Font, Alignment, Scale,
EventDispatcher, EventTypes, RectDrawer, Annotations,
VerticalPosition, HorizontalPosition} from '@tomsoftware/webgl-chart';
import { Generators } from './generators';


let debugTexture = false;
const eventDispatcher = new EventDispatcher();
const showLines = ref<boolean>(true);
const showDots = ref<boolean>(true);
const lineThickness = ref<number>(1);
const radius = ref<number>(0.1);

const scaleX = new Scale(0, 10);
const scaleY = new Scale(-10, 10);

// generate time data
const itemCount = 1000 * 60 * 60 / 4;

const time = new GpuFloatBuffer(itemCount)
    .generate((i) => i * 0.001); // in seconds

// generate series data
const series1 = new Series(time, null)
    .generate((t) => Generators.generateSin(t))
    .setColor(Color.blue)
    .setPointSize(5);
  
const series2 = new Series(time, null)
    .generate((t) => Generators.generateEKG(t * 10) * 10)
    .setColor(Color.green)
    .setPointSize(4)
/*
watch(() => scaleXStart.value, (newValue) => {
  scaleX.min = +newValue;
});
*/
const annotations = new Annotations();
annotations.addBox(5.5, 3, 9, -3, Color.purple, 200);
annotations.addVerticalLine(1.5,  Color.red, 10)
  .addLabel(
    new GpuText('Hallo World').setColor(Color.white),
    Color.grayFromBytes(20, 0.7), VerticalPosition.Bottom);
annotations.addVerticalLine(7.5, Color.red);
annotations.addHorizontalLine(9, Color.red, 10)
  .addLabel(
    new GpuText('Hallo World').setColor(Color.white),
    Color.grayFromBytes(20, 0.7), HorizontalPosition.Right);


// define axis
const xAxis = new HorizontalAxis(new GpuText('X Axis'), scaleX)
  .setBorderColor(Color.darkGray)
  .setPosition(HorizontalAxisPosition.Bottom)
  .setGridColor(Color.lightGray);

const yAxis1 = new VerticalAxis(new GpuText('Y Axis 1',new Font('Arial', 20)).setColor(Color.purple).setRotation(90));
const yAxis2 = new VerticalAxis(new GpuText('Y Axis 2').setRotation(90), scaleY)
  .setBorderColor(Color.darkGray)
  .setGridColor(Color.lightGray);
const yAxis3 = new VerticalAxis(new GpuText('Y right').setRotation(90))
  .setPosition(VerticalAxisPosition.Right);


const headline = new GpuText('My new Chart');

const legend = new GpuText('Legend');

// define layout
const baseContainer = new LayoutCell();
const baseRow = baseContainer.addLayout(new VerticalLayout(ScreenPosition.fromPixel(10)));

const headlineLayout = baseRow.addFixedCell([headline]);
const legendLayout = baseRow.addFixedCell([legend]);
const innerContainer = baseRow.addRelativeCell(1);

// horizontal layout for y axis and chart-data
const column = innerContainer.addLayout(new HorizontalLayout());
const columnAxis1CellLeft = column.addFixedCell(yAxis1);
const columnAxis2CellLeft = column.addFixedCell(yAxis2);
const columnChartCell = column.addRelativeCell(1); // 100% of empty space
const columnAxisCellRight = column.addFixedCell([yAxis3]);

// vertical layout for x axis and chart-data
const row = innerContainer.addLayout(new VerticalLayout());
const rowChartCell = row.addRelativeCell(1); // 100% of empty space
const rowAxisCell = row.addFixedCell([xAxis]);

// const chartCell = innerContainer.addLayout(new IntersectedLayout(rowChartCell, columnChartCell));
const xAxisCell = innerContainer.addLayout(new IntersectedLayout(rowAxisCell, columnChartCell));
const yAxis1Cell = innerContainer.addLayout(new IntersectedLayout(columnAxis1CellLeft, rowChartCell));
const yAxis2Cell = innerContainer.addLayout(new IntersectedLayout(columnAxis2CellLeft, rowChartCell));
const yAxis3Cell = innerContainer.addLayout(new IntersectedLayout(columnAxisCellRight, rowChartCell));
const chartCell = innerContainer.addLayout(new IntersectedLayout(columnChartCell, rowChartCell));


const chartBorder = new LayoutBorder(Color.green);

console.log('itemCount: ', itemCount);


eventDispatcher.on(EventTypes.Wheel, columnChartCell, (event) => {
  scaleX.zoom(event.wheelDelta / 600);
});

eventDispatcher.on(EventTypes.Pan, columnChartCell, (event, _layoutNode, area) => {
  scaleX.pan(event.panDeltaX / area.width);
});


eventDispatcher.on(EventTypes.Wheel, yAxis2Cell, (event) => {
  scaleY.zoom(event.wheelDelta / 600);
});

eventDispatcher.on(EventTypes.Pan, yAxis2Cell, (event, _layoutNode, area) => {
  scaleY.pan(- event.panDeltaY / area.height);
});


const rec = new RectDrawer();


// set render callback
const data1 = new ChartConfig()
    .setRenderCallback((context) => {

      if (debugTexture == true) {
        debugTexture = false;
        const img = context.exportTextureHtmlImage();
        if (img == null) {
          return;
        }
        Utilities.DownloadImage(img, 'texture');
      }

      context.calculateLayout(baseContainer);

      eventDispatcher.dispatch(context);
      // context.layoutCache.draw(context);

      // yAxisCell.setMinWidth();

      chartBorder.draw(context, baseContainer);

      ///const trafoSeries = new Matrix3x3().scale(0.1, 0.01).translate(-0.95 + (context.time % 1000) * 0.001, 0);

      headline.draw(context, headlineLayout, Alignment.centerCenter, new Matrix3x3());
      legend.draw(context, legendLayout, Alignment.centerCenter, new Matrix3x3());

      //text1.draw(context, new Matrix3x3().translate(0.5, 0.2));
      //text2.draw(context, new Matrix3x3().rotateDeg(rotation.value).translate(translation.value, 0.2));
      //text3.draw(context, new Matrix3x3().translate(0.5, 0.1));

      // new LayoutBorder(Color.blue).draw(context, columnChartCell);
      // new LayoutBorder(Color.red).draw(context, columnAxisCellRight);
      
      xAxis.draw(context, xAxisCell, chartCell);
      yAxis1.draw(context, yAxis1Cell);
      yAxis2.draw(context, yAxis2Cell, chartCell);
      yAxis3.draw(context, yAxis3Cell);

      // flush lines and textures
      context.flush();

      // draw the series
      if (showDots.value) {
        series1.drawPoints(context, scaleX, scaleY, chartCell);
      }
      if (showLines.value) {
        series1.setThickness(lineThickness.value).drawLines(context, scaleX, scaleY, chartCell);
      }
      
      if (showDots.value) {
        series2.drawPoints(context, scaleX, scaleY, chartCell);
      }
      if (showLines.value) {
        series2.drawLines(context, scaleX, scaleY, chartCell);
      }

      /*
      rec.clear();
      rec.addRect2(new Vector2(0.5, 0.1),  new Vector2(0.2, 0.1),  Color.red,   radius.value);
      rec.addRect2(new Vector2(0.33, 0.1), new Vector2(0.1, 0.1), Color.black, radius.value);
      rec.addRect2(new Vector2(0.1, 0.1),  new Vector2(0.1, 0.1),  Color.blue,  1.0);
      rec.addRect2(new Vector2(0.21, 0.1),  new Vector2(0.1, 0.1),  Color.purple,  1.0);

      rec.draw(context, chartCell, context.projectionMatrix);
      */

      // draw annotations
      annotations.draw(context, scaleX, scaleY, chartCell);
  });

function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element)
}

const data2 = new ChartConfig()
    .setRenderCallback((context) => {
      context.calculateLayout(baseContainer);
      context.layoutCache.draw(context);

      series1.drawPoints(context, scaleX, scaleY, xAxisCell);
  });


function onDownloadTexture() {
  debugTexture = true;
}
</script>

<template>
  Frame rate: {{ data1.maxFrameRate.value }}
  <input type="range" min="0" max="100" v-model="data1.maxFrameRate.value" />

  <label>
    <input type="checkbox" v-model="showDots" />
    show Dots
  </label>
  <label>
    <input type="checkbox" v-model="showLines" />
    show Lines
  </label>
  <label> 
    <input type="number" min="0" max="100" v-model="lineThickness" />
    Lines thickness
  </label>

  <label>
  radius:
  <div style="width:3em; display: inline-block;">{{ radius }}</div>
  <input type="range" min="0" max="1" step="0.01" v-model="radius" />
  </label>

  <button v-on:click="onDownloadTexture()">download texture</button>
  
  <!--
  scaleX start: <div style="width:30pt; display: inline-block;">{{scaleXStart }}</div>
  <input type="range" min="0" max="2000" step="0.001" v-model="scaleXStart" />
  -->

 <div class="grid-container">
  <div class="grid-item">
    <chart
      :data="data1"
      @on-bind="onBind"
      class="chart"
    />
  </div>
  <div class="grid-item">
    <chart
      :data="data2"
      class="chart"
    />
  </div>
</div>

</template>

<style scoped>
.chart {
  width: 100%;
}

.grid-container {
  display: grid;
  width: 100%;
  height: 600px;
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