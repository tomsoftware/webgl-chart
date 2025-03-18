# Basic Renderer

The renderer is used to draw all elements of the chart, including axes, series, and text. It is implemented as a callback providing a `context` object. Depending on your setup you can create the renderer:

::: code-tabs#shell

@tab plain js
```ts{6}
const gpuChart = new GpuChart();
// bind the chart a <canvas> element
gpuChart.bind(document.getElementById('MyCanvas'));
gpuChart.setMaxFrameRate(2); // Hz
gpuChart.setRenderCallback((context) => {
    // render the chart here
}
```

@tab VUE
```vue{11-13}
<script setup lang="ts">
import { EventDispatcher, LayoutCell } from '@tomsoftware/webgl-chart'
import { Chart, ChartConfig } from '@tomsoftware/webgl-chart-vue'

// setup data and layout
const baseContainer = new LayoutCell();
const eventDispatcher = new EventDispatcher();

const chartData = new ChartConfig()
  .setRenderCallback((context) => {
      // process events
      eventDispatcher.dispatch(context);
      // render the chart here
  });

// config chart
chartData.setMaxFrameRate(12); // Hz

// event that is fired when the canvas and the 3d context is created
function onBind(element: HTMLElement | null): void {
  eventDispatcher.bind(element)
}

</script>

<template>
  <chart :data="chartData" @on-bind="onBind" />
</template>
```

@tab React
```js{13-15}
import './App.css'
import { EventDispatcher, LayoutCell } from '@tomsoftware/webgl-chart';
import { Chart, ChartConfig} from '@tomsoftware/webgl-chart-react';

function App() {
  // setup data and layout
  const baseContainer = new LayoutCell();
  const eventDispatcher = new EventDispatcher();

  // create chart
  const chartData = new ChartConfig()
    .setRenderCallback((context) => {
        // process events
        eventDispatcher.dispatch(context);
        // render the chart here
    });

  // config chart
  chartData.setMaxFrameRate(10);

  // event that is fired when the canvas and the 3d context is created
  function onBind(element: HTMLElement | null): void {
    eventDispatcher.bind(element)
  }

  return (
    <>
      <Chart data={chartData} onBind={onBind} />
    </>
  )
}

export default App

:::

<!--

### Layout
Layout defines how different components (e.g. text, axis and series) are arranged within the chart.

| Argument | Type | Description |
| --- | --- | --- |
| LayoutCell | Object | The basic unit of layout. |
| VerticalLayout | Object | Arranges elements vertically. |
| HorizontalLayout | Object | Arranges elements horizontally. |
| IntersectedLayout | Object | Overlays one layout on another. |
| ScreenPosition | Object | Defines positions in screen coordinates. |

---

### Series
Series represent the dataset that is plotted on the chart.

| Argument | Type | Description |
| --- | --- | --- |
| Series | Object | The series object containing data points. |
| GpuFloatBuffer | Object | The buffer containing data points. |
| setColor | Function | Sets the color of the series. |
| setPointSize | Function | Sets the size of points in the series. |
| drawLines | Function | Draws the series as lines on the chart. |

---

### Axis
Axes define the scales and labels for the data points on the chart.

| Argument | Type | Description |
| --- | --- | --- |
| HorizontalAxis | Object | The horizontal axis. |
| VerticalAxis | Object | The vertical axis. |
| setBorderColor | Function | Sets the border color of the axis. |
| setPosition | Function | Sets the position of the axis. |
| setGridColor | Function | Sets the color of the grid lines. |

---

### Scale
Scales define the range of values shown by the axes.

| Argument | Type | Description |
| --- | --- | --- |
| Scale | Object | The scale object defining the range. |
| zoom | Function | Zooms the scale in or out. |
| pan | Function | Pans the scale left or right. |

---


### Events
Events are used to add interactivity to the chart, such as zooming and panning.

| Argument | Type | Description |
| --- | --- | --- |
| eventDispatcher | EventDispatcher | The object responsible for handling events. |
| EventTypes | Enum | The types of events that can be handled (e.g., Wheel, Pan). |
| element | Object | The chart element that the event is attached to. |
| handler | Function | The function that handles the event. |

---

-->