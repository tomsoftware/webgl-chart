# Area Series

Area Charts / Series can be rendered using the `SeriesArea` class. Each area is defined by time values and upper/lower boundaries, displaying the filled region between them.

<example-series-area />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-series-area.vue)
</details>

## Creating an Area Series

An area series requires three GPU buffers:

- `time: GpuBuffer<'float32'>` : the time positions along the x-axis
- `upper: GpuBuffer<'float32'>` : the upper boundary values
- `lower: GpuBuffer<'float32'>` : the lower boundary values

```ts
const time = new GpuGrowingBuffer('float32', [0, 1, 2, 3]);
const upper = new GpuGrowingBuffer('float32', [1, 2, 1, 3]);
const lower = new GpuGrowingBuffer('float32', [0, 1, 0, 1]);

const area = new SeriesArea(time, upper, lower)
    .setColor(Color.blue, Color.lightGray);
```

---

## Configuration

### setColor

`setColor(upperColor: Color, lowerColor?: Color | null)`

Sets the RGBA colors for the top and bottom boundaries of the area. If the colors are different, they will be blended.

```ts
area.setColor(new Color(0.2, 0.6, 1.0, 1.0), new Color(0.8, 0.8, 0.8, 0.5));
```

> **Tip:** Use additional `SeriesPoint` or `SeriesLine` to add outlines or points to the area boundaries for better visualization.

Finally, drawing the area in the rendering loop:

```ts
area.draw(context, scaleX, scaleY, chartLayout);
```
