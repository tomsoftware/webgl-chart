# Bubble Series

Bubble Charts / Series can be rendered using the `SeriesBubble` class. Each circle is defined by its center coordinates (x, y) and radius. All circles in a series share the same color.


<example-series-bubble />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-series-bubble.vue)
</details>

## SeriesBubble

Creating a new bubble series:

```ts
new SeriesBubble(x: GpuFloatBuffer, y: GpuFloatBuffer, radius: GpuFloatBuffer);
```

Example:

```ts
const xBuffer = new GpuFloatBuffer([1, 2, 3]);
const yBuffer = new GpuFloatBuffer([1, 2, 3]);
const radiusBuffer = new GpuFloatBuffer([5, 8, 15]);

const bubble = new SeriesBubble(xBuffer, yBuffer, radiusBuffer)
    .setColor(Color.blue).
    .setBubbleScaling(1)
```

And drawing the circles:

```ts
bubble.draw(context, scaleX, scaleY, chartLayout);
```
