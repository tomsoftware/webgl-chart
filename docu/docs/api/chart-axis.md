# Chart Axis

Chart axes are used to display scales, tick marks, labels, and optional grid lines in charts. They provide visual reference for data values along the horizontal (x) and vertical (y) dimensions.

## Large Numeric Values and WebGL Precision

> **Note:** WebGL shaders use 32‑bit floating point values. When you pass very large numbers (for example, raw timestamps or values with a large constant offset) directly to the GPU, you can lose precision and see rendering artifacts or incorrect data positions.

### Recommended fixes

* Send relative values to the GPU. Subtract a stable base/offset on the CPU and send the smaller relative values to the shader.
* Keep the original offset for labels. Use the axis tick formatter `setTickFormat` to add the offset back when rendering tick text.
* Scale down if appropriate. Convert units (e.g., seconds -> days, milliseconds -> seconds) so numbers are smaller and within a safe precision range.


## Types of Axes

- **HorizontalAxis**: Displays along the x-axis (bottom or top of the chart)
- **VerticalAxis**: Displays along the y-axis (left or right of the chart)

Both axis types inherit from `AxisBase` and share common configuration options.

## Creating an Axis

Axes are typically created as part of a `BasicChartLayout`. Here's how to create and configure axes:

```ts
import { HorizontalAxis, VerticalAxis, Scale, GpuText } from '@tomsoftware/webgl-chart';

// Create scales
const scaleX = new Scale(0, 100);
const scaleY = new Scale(0, 1000);

// Create axes with labels
const xAxis = new HorizontalAxis(new GpuText('Time'), scaleX);
const yAxis = new VerticalAxis(new GpuText('Value'), scaleY);

// Configure in layout
const basicLayout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
basicLayout.addYScale(scaleY, 'Value');
basicLayout.xAxis = xAxis;
basicLayout.yAxis = yAxis;
```

---

## Configuration

### Common Axis Properties

#### `setBorderColor(color: Color)`
Sets the color of the axis border line.

```ts
axis.setBorderColor(Color.black);
```

#### `setTickColor(color: Color)`
Sets the color of tick lines and tick text.

```ts
axis.setTickColor(Color.gray);
```

#### `setTickLength(pixels: number)`
Sets the length of tick lines in pixels.

```ts
axis.setTickLength(10);
```

#### `setTickTextPadding(pixels: number)`
Sets the padding between tick lines and tick text in pixels.

```ts
axis.setTickTextPadding(5);
```

#### `setGridColor(color: Color | null)`
Enables or disables grid lines with the specified color. Pass `null` to disable.

```ts
axis.setGridColor(Color.lightGray);
```

#### `setTickFont(font: Font)`
Sets the font for tick labels.

```ts
axis.setTickFont(new Font('Arial', 12));
```

### Tick Label Formatting

#### `setTickFormat(func: TickLabelFormat)`
Customizes how tick values are formatted as strings. The default uses `AxisBase.defaultFormatTickLabel`.

```ts
// Format as percentage
axis.setTickFormat((value) => `${value}%`);

// Format as currency
axis.setTickFormat((value) => `$${value.toFixed(2)}`);

// Format as date (for time-based axes)
axis.setTickFormat((value) => new Date(value).toLocaleDateString());
```

<example-axis-tick-format />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-axis-tick-format.vue)
</details>

### Axis Orientation

Sets the orientation of the axis.

For horizontal axis:   
`setOrientation(orientation: HorizontalAxisOrientation)`

For vertical axis:   
`setOrientation(orientation: VerticalAxisOrientation)`


<example-axis-orientation />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-axis-orientation.vue)
</details>



### Grid Lines

Grid lines help read values across the chart. Enable them with `setGridColor()`.

<example-axis-grid />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-axis-grid.vue)
</details>

## Drawing Axes

Axes are automatically drawn when you call `basicLayout.draw(context)` in your render callback. The layout handles positioning and sizing of axes relative to the chart area.