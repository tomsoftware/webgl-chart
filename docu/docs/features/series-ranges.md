# Range Series

Range series can be rendered using the `SeriesRangeRect` and `SeriesRangeLine` classes. These series draw elements between two y-values, making them ideal for displaying ranges, error bars, or financial data like candlesticks.

## Range Rectangular Series

Draws a rectangle between the lower and upper y-values at each x-position.

<example-series-range-rect />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-series-range-rect.vue)
</details>

## Creating a Range Rectangular Series

A range rectangular series requires three GPU buffers:

- `x: GpuBuffer<'float32'>` — the x-positions of each rectangle
- `y1: GpuBuffer<'float32'>` — the lower y-values
- `y2: GpuBuffer<'float32'>` — the upper y-values

```ts
const xBuffer = new GpuGrowingBuffer('float32', [1, 2, 3]);
const y1Buffer = new GpuGrowingBuffer('float32', [1, 2, 3]);
const y2Buffer = new GpuGrowingBuffer('float32', [2, 3, 4]);

const rect = new SeriesRangeRect(xBuffer, y1Buffer, y2Buffer)
    .setColor(Color.lightBlue)
    .setBarWidth(0.05);
```

---

## Configuration for Range Rectangular Series

### `setColor(color1: Color, color2?: Color)`
Sets the fill color of the rectangles. The color is determined by the condition: if `y1 <= y2`, uses `color1`; otherwise uses `color2`. If `color2` is not provided, `color1` is used for both cases.

```ts
rect.setColor(Color.darkGreen, Color.red);
```

### `setBarWidth(value: number)`
Sets the width of each rectangle **in data units**. The rectangles are drawn symmetrically around the x-position.

```ts
rect.setBarWidth(0.5);
```

Finally, drawing the rectangles in the rendering loop:

```ts
rect.draw(context, scaleX, scaleY, chartLayout);
```

## Range Line Series

Draws a vertical line between the lower and upper y-values at each x-position.

<example-series-range-line />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-series-range-line.vue)
</details>

## Creating a Range Line Series

A range line series requires three GPU buffers:

- `x: GpuBuffer<'float32'>` — the x-positions of each line
- `y1: GpuBuffer<'float32'>` — the lower y-values
- `y2: GpuBuffer<'float32'>` — the upper y-values

```ts
const xBuffer = new GpuGrowingBuffer('float32', [1, 2, 3]);
const y1Buffer = new GpuGrowingBuffer('float32', [1, 2, 3]);
const y2Buffer = new GpuGrowingBuffer('float32', [2, 3, 4]);

const line = new SeriesRangeLine(xBuffer, y1Buffer, y2Buffer)
    .setColor(Color.black)
    .setLineWidth(1);
```

---

## Configuration for Range Line Series

### `setColor(color: Color)`
Sets the RGBA color of the lines.

```ts
line.setColor(new Color(0, 0, 0, 1));
```

### `setLineWidth(value: number)`
Sets the width of the lines **in pixels**.

```ts
line.setLineWidth(2);
```

Finally, drawing the lines in the rendering loop:

```ts
line.draw(context, scaleX, scaleY, chartLayout);
```

## Candlestick Series

Candlestick charts can be created by combining `SeriesRangeRect` for the body (open/close) and `SeriesRangeLine` for the wicks (high/low).

In the example, the body is created with `y1 = open` and `y2 = close`, using conditional coloring:
- Green (`Color.darkGreen`) when `open <= close` (rising or neutral price)
- Red (`Color.red`) when `open > close` (falling price)

<example-series-candlestick />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-series-candlestick.vue)
</details>

