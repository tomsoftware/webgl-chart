<script setup lang="ts">
import { Chart, ChartConfig } from '@tomsoftware/webgl-chart-vue';
import { GpuText, LayoutCell, Alignment, Color, EventDispatcher, 
  EventTypes, LayoutBorder, 
  Matrix3x3} from '@tomsoftware/webgl-lib';

const text = new GpuText('x', undefined, Color.red);

// define layout
const baseContainer = new LayoutCell();

const border = new LayoutBorder(Color.green);

// position to draw to inside the baseContainer
let pos = Matrix3x3.Identity;

// create event dispatcher
const eventDispatcher = new EventDispatcher();

// register events
eventDispatcher.on(EventTypes.Wheel, baseContainer, (e) => {
  if (Math.abs(e.wheelDelta) < 1) {
    return;
  }

  const s = (e.wheelDelta < 0) ? 1.2 : 0.8;
  pos = pos.scale(s, s);
});

eventDispatcher.on(EventTypes.Pan, baseContainer, (e) => {
  pos = pos.translate(e.panDeltaX, e.panDeltaY);
});

// set render callback
const chartData = new ChartConfig()
  .setRenderCallback((context) => {
    context.calculateLayout(baseContainer);

    // dispatch events
    eventDispatcher.dispatch(context);

    // draw border around the container
    border.draw(context, baseContainer);

    // draw 'x'
    text.draw(context, baseContainer, Alignment.centerCenter, pos);
  });
chartData.setMaxFrameRate(15);
</script>

<template>
  <chart
    :data="chartData"
    class="chart"
    @onBind="(el) => eventDispatcher.bind(el)"
  />
</template>