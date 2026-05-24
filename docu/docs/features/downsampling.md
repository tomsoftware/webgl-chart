# Downsampling

Downsampling reduces the number of points that are rendered while keeping important visual features (peaks and valleys). This library provides a simple and efficient two-step downsampling pipeline based on uniform sampling for the X axis and min/max binning for Y values.

## Drawing reduced Min-Max values as *SeriesArea*
This example
- selects uniformly spaced sample indices for the visible X range using `UniformSampler`.
- computes the minimum and maximum Y values for each bin defined by the sampled X indices using `DownsamplingMinMaxBin`.
- draws ara chart between min and max values
- draw min and max points

<example-downsampling-min-max />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-downsampling-min-max.vue)
</details>


This approach preserves local extrema which are important for visual fidelity while drastically reducing the number of points to render.

## How it works

1. Choose the number of horizontal samples to represent the plotted range. A good default is the pixel width of the plotted chart area — one sample per pixel.
2. Use `UniformSampler.process(min, max, numberOfPoints)` to get evenly spaced `indexes` and reduced `values` for X.
3. Give the returned `indexes` to `DownsamplingMinMaxBin.process(indexes)` to compute `minValues` and `maxValues` for each bin.
4. Render the result using `SeriesPoint`, `SeriesArea` or a custom renderer.

## API

### `UniformSampler<T>`

- `constructor(type: GpuBufferDataType, values: GpuReadableBuffer, numberOfPoints: number)`
- `process(min: number, max: number, numberOfPoints: number)` — returns `{ indexes: Uint32Array, values: GpuFixBuffer<T> }`

### `DownsamplingMinMaxBin<T>`

- `constructor(type: GpuBufferDataType, values: GpuReadableBuffer, numberOfPoints: number)`
- `process(binIndexes: Uint32Array)` — fills `minValues` and `maxValues` buffers and returns `{ min, max }`

## Example

This project includes a ready-to-run example: `<example-downsampling-min-max />`. The core `processDownSampling` function looks like this:

```ts
function processDownSampling(scale: Scale, pixelWidth: number) {
  const result = downsamplingMinMaxBinX.process(scale.min, scale.max, pixelWidth);
  downsamplingMinMaxBinY1.process(result.indexes);
}
```

In the rendering loop you can compute the plotted pixel width from the layout area and the current `Context`:

```ts
const area = basicLayout.chartCell.getArea(context.layoutCache);
const pixelWidth = Math.max(1, Math.floor(area.width * context.width));
processDownSampling(scaleX, pixelWidth);
```

## Tips

- Use the plotted area width (not the full canvas width) to adapt sampling to the actual viewport of the series.
- Re-run the downsampling whenever the X-scale changes or the layout is resized.
- If processing becomes expensive on rapid interactions, debounce the call or throttle updates to a lower frame rate.

