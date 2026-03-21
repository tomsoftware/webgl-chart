# Bar Series

Bar Charts / Series can be rendered using the `SeriesBar` class.  Each bar is defined by an `(x, y)` pair, where:

- **x** is the bar’s horizontal position in data units
- **y** is the bar’s height in data units

All bars in a series share the same color, width, and optional horizontal offset.

<example-series-bar />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-series-bar.vue)
</details>

## Creating a Bar Series

A bar series requires two GPU buffers:

- `x: GpuFloatBuffer` — the x‑positions of each bar
- `y: GpuFloatBuffer` — the heights of each bar

```ts
const xBuffer = new GpuFloatBuffer([1, 2, 3]);
const yBuffer = new GpuFloatBuffer([1, 2, 3]);

const bar = new SeriesBar(xBuffer, yBuffer)
    .setColor(Color.blue)
    .setBarWidth(0.1)   // width in data units
    .setOffsetX(0);     // offset in data units
```

---

## Configuration

### `setColor(color: Color)`
Sets the RGBA color of the entire bar series.

```ts
bar.setColor(new Color(0.2, 0.6, 1.0, 1.0));
```

### `setBarWidth(value: number)`
Sets the width of each bar **in data units**.
The bars are drawn of this width symmetrically around the bar’s x‑position.

```ts
bar.setBarWidth(0.1);
```

### `setOffsetX(value: number)`
Applies a horizontal offset **in data units**.
Useful when rendering multiple bar series side‑by‑side.

```ts
bar.setOffsetX(0.05);
```
> **Tip:** For 2 bar-series one have offset 0 and the other half of bar width

Example:

```ts
const xBuffer = new GpuFloatBuffer([1, 2, 3]);
const yBuffer = new GpuFloatBuffer([1, 2, 3]);

const bar = new SeriesBar(xBuffer, yBuffer, radiusBuffer)
    .setColor(Color.blue)
    .setBarWidth(0.04)
    .setOffsetX(0);
```

Finally drawing the bars in the rendering loop:

```ts
bar.draw(context, scaleX, scaleY, chartLayout);
```
