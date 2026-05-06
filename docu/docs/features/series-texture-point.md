# Texture Point Series

Texture Point Charts / Series can be rendered using the `SeriesTexturePoint` class. Each point is defined by an `(x, y)` pair, where:

- **x** is the point's horizontal position in data units
- **y** is the point's vertical position in data units

All points in a series share the same color and texture generator for markers.

<example-series-texture-point />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-series-texture-point.vue)
</details>

## Creating a Texture Point Series

A texture point series requires two GPU buffers:

- `x: GpuBuffer<'float32'>` - the x-positions of each point
- `y: GpuBuffer<'float32'>` - the y-positions of each point

```ts
const xBuffer = new GpuGrowingBuffer('float32', [1, 2, 3]);
const yBuffer = new GpuGrowingBuffer('float32', [1, 2, 3]);

const pointSeries = new SeriesTexturePoint(xBuffer, yBuffer)
    .setColor(Color.blue)
    .setTextureGenerator(TextTextureGenerator.getCached('X', new Font('sans-serif', 10)));
```

---

## Configuration

### `setColor(color: Color)`
Sets the RGBA color of the entire point series.

```ts
pointSeries.setColor(new Color(0.2, 0.6, 1.0, 1.0));
```

### `setTextureGenerator(generator: TextureGenerator)`
Sets the texture generator used to create markers for the points. This allows using custom symbols, text, or SVG images as point markers.

#### Using TextTextureGenerator
For simple text markers, use `TextTextureGenerator.getCached()` to create or reuse a cached texture:

```ts
// Use a single character as marker
const textGenerator = TextTextureGenerator.getCached('X', new Font('sans-serif', 10));
pointSeries.setTextureGenerator(textGenerator);

// Use Unicode characters
const unicodeGenerator = TextTextureGenerator.getCached('🦄', new Font('sans-serif', 15));
pointSeries.setTextureGenerator(unicodeGenerator);
```

#### Using SvgTextureGenerator
For custom SVG markers, create an `SvgTextureGenerator` instance:

```ts
const starSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="300px" height="275px">
  <path
    fill="white"
    stroke="black"
    stroke-width="10"
    d="M150,25 L179,111 L269,111 L197,165 L223,251  L150,200 L77,251  L103,165 L31,111 L121,111Z"
  />
</svg>`;

const svgGenerator = new SvgTextureGenerator('star-marker', starSvg, 30);
pointSeries.setTextureGenerator(svgGenerator);
```

The `SvgTextureGenerator` constructor takes:
- `textureKey`: A unique identifier string
- `svg`: The SVG markup as a string
- `width` (optional): Target rasterization width
- `height` (optional): Target rasterization height

Finally drawing the points in the rendering loop:

```ts
pointSeries.draw(context, scaleX, scaleY, chartLayout);
```
