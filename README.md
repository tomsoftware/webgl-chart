# WebGl-chart
<p align="center">
   <img src="./logo/webgl-chart-logo.svg" alt="logo" width="100"/>
   <br />
</p>

Free high performance web Chart Library to plot line-, bar-, area-, bubble-charts and annotations using WebGL.

![showcase](images/showcase.png) 

<table>
  <tr>
    <th>Bubble Chart</th>
    <th>Bar Chart</th>
  </tr>
  <tr>
    <td><img src="images/showcase_bubble_chart.png" height="150"></td>
    <td><img src="images/showcase_bar_chart.png" height="150"></td>
  </tr>

  <tr>
    <th>Area Charts</th>
    <th>Candlestick Chart</th>
  </tr>
  <tr>
    <td><img src="images/showcase_area.png" height="150"></td>
    <td><img src="images/showcase_candlestick_chart.png" height="150"></td>
  </tr>

  <tr>
    <th>Annotations</th>
    <th>Rolling &amp; Sliding Window</th>
  </tr>
  <tr>
    <td><img src="images/showcase_annotations.png" height="150"></td>
    <td><img src="images/showcase_rolling_chart.png" height="150"></td>
  </tr>

  <tr>
    <th>Stacked</th>
    <th>Multi axis</th>
  </tr>
  <tr>
    <td><img src="images/showcase_stacked.png" height="150"></td>
    <td><img src="images/shaowcase_multi_axis.png" height="150"></td>
  </tr>
</table>


## Install

| Package | Description
|---|---|
| [@tomsoftware/webgl-chart](https://www.npmjs.com/package/@tomsoftware/webgl-chart) | Core WebGL chart engine <br> `npm i @tomsoftware/webgl-chart --save` |
| [@tomsoftware/webgl-chart-vue](https://www.npmjs.com/package/@tomsoftware/webgl-chart-vue) | Vue wrapper for core chart <br>  `npm i @tomsoftware/webgl-chart-vue --save` |
| [@tomsoftware/webgl-chart-react](https://www.npmjs.com/package/@tomsoftware/webgl-chart-react) | React wrapper for core chart <br>  `npm i @tomsoftware/webgl-chart-react --save` |


# Documentation
See https://chart.hmilch.net/ for examples and documentation.


# Examples
Explore the [example](./example) folder for basic examples to get you started.

## Basic usage (simplified)

This library is not a config-only chart kit. It exposes a low-level rendering loop where you draw axes, series data and annotations yourself inside WebGL frame callbacks.

That means maximum flexibility for advanced visual controls (custom mark rendering, animated transitions, pixel-perfect overlays), instead of a limited declarative chart config API.

```ts
// (1) prepare data buffers
const time = new GpuGrowingBuffer('float32', [1, 2, 3]);

// (2) create series objects
const points = new SeriesPoint(time, new GpuGrowingBuffer('float32', [3.1, 4.2, 5.3])
  .setColor(Color.blue)
  .setPointSize(4);

const line = new SeriesLine(time, new GpuGrowingBuffer('float32', [1.1, 2.2, 3.3])
  .setColor(Color.darkGreen)
  .setThickness(2);

const bars = new SeriesBar(time, new GpuGrowingBuffer('float32', [4, 3, 2])
  .setColor(Color.red)
  .setBarWidth(0.02);

// (3) layout and scales
const scaleX = new Scale(0, 10);
const scaleY = new Scale(-10, 20);
const layout = new BasicChartLayout(dispatcher, container, scaleX);

// (4) chart configuration
const config = new ChartConfig().setRenderCallback(ctx => {
  // render loop will be processed every redraw
  ctx.calculateLayout(container);

  layout.draw(ctx);

  points.draw(ctx, scaleX, scaleY, layout.chartCell);
  line.draw(ctx, scaleX, scaleY, layout.chartCell);
  bars.draw(ctx, scaleX, scaleY, layout.chartCell);
});
```

# Build, debug and contribute

## Project structure

This repository monorepo structure:

- `packages/webgl-lib`: core utilities (vector/math, colors, layout, event handling, text rendering).
- `packages/webgl-chart`: chart rendering engine (line, bar, bubble, area, tooltip) depending on `webgl-lib`.
- `packages/webgl-chart-vue`: Vue wrapper for `webgl-chart`.
- `packages/webgl-chart-react`: React wrapper for `webgl-chart`.
- `docu`: VuePress documentation site.


## Contributions Welcome

Any contributions, feedback, or bug reports are welcome. Please open issues or pull requests on GitHub in order to help improve the library, documentation and examples.