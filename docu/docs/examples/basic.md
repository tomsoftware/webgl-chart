# Basics

This document explains the essential building blocks used in `example-basic.vue`:

- `Scale` for data range definition on axes
- `EventDispatcher` for input and interaction handling
- `BasicChartLayout` for axis and chart region arrangement
- `ChartConfig` render loop via `setRenderCallback`

<example-basic />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-basic.vue)
</details>

## Data and Axis Scales

`Scale` controls the visible data range.

```ts
const scaleX = new Scale(0, 1);
const scaleY = new Scale(-5, 25);
```

Link scales to the layout:

```ts
basicLayout.addYScale(scaleY, 'Value');
basicLayout.xAxis.label?.setText('Time');
```

## Event Dispatcher

`EventDispatcher` handles mouse/touch events and feeds them into the rendering system.

```ts
const eventDispatcher = new EventDispatcher();

function onBind(element: HTMLElement | null) {
  eventDispatcher.bind(element);
}
```

Inside the render callback:

```ts
eventDispatcher.dispatch(context);
```

## BasicChartLayout

`BasicChartLayout` positions the chart frame, axes, and labels.

```ts
const baseContainer = new LayoutCell();
const basicLayout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
```

In render loop:

```ts
context.calculateLayout(baseContainer);
basicLayout.draw(context);
```

## Rendering Loop

The main loop is defined in `ChartConfig.setRenderCallback`.

```ts
const myChart = new ChartConfig().setRenderCallback((context) => {
  context.calculateLayout(baseContainer);
  eventDispatcher.dispatch(context);
  basicLayout.draw(context);
  series1.draw(context, scaleX, scaleY, basicLayout.chartCell);
  series3.draw(context, scaleX, scaleY, basicLayout.chartCell);
});

myChart.setMaxFrameRate(12);
```

## Series Types

### Point Series

`SeriesPoint` draws points at each data coordinate and supports variable point size.

```ts
const series1 = new SeriesPoint(time)
  .generate((t) => Generators.generateSin(t))
  .setColor(Color.blue)
  .setPointSize(5);
```

### Line Series

`SeriesLine` draws connected lines between data coordinates.

```ts
const series3 = new SeriesLine(time)
  .generate((t) => Generators.generateIO(t * 10) * 20)
  .setColor(Color.darkGreen)
  .setThickness(2);
```

---

