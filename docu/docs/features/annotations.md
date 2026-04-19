# Annotations

Annotations allow you to overlay visual markers on top of a chart area: vertical/horizontal lines, boxes, and labels. In this example, annotations are drawn in the chart coordinate system and transformed with chart scaling.

<example-annotations />
<details>
  <summary>Source</summary>

  @[code](../../examples/example-annotations.vue)
</details>


## Box

```ts
annotations.addBox(x1, y1, x2, y2, color, radius = 0)
```

- draws a rectangle in data coordinates
- optional corner radius for rounded corners
- can highlight chart ranges (e.g. thresholds, regions)

## Vertical Line

```ts
annotations.addVerticalLine(x, color, stripeWidth = 0, lineThickness = 1)
```

- adds a vertical stripe at a data x position
- `stripeWidth` allows drawing a thicker area (band)
- `lineThickness` controls line width

## Horizontal Line

```ts
annotations.addHorizontalLine(y, color, stripeWidth = 0, lineThickness = 1)
```

- adds a horizontal stripe at a data y position
- `stripeWidth` is band width, `lineThickness` is line height

## Labels for lines

Vertical/horizontal line annotations support to add labels:

```ts
// Vertical line with label at bottom
annotations.addVerticalLine(0.3, Color.red, 10, 2)
  .addLabel(
    new GpuText('red marker'), // text, font and font color
    Color.red,  // background color
    VerticalPosition.Bottom, // position
    10,   // padding
    70,   // boxRadius
    10    // margin
  );
```

```ts
// Horizontal line with centered label
annotations.addHorizontalLine(10, Color.green, 5, 2)
  .addLabel(
    new GpuText('green marker'), // text, font and font color
    Color.green,  // background color
    HorizontalPosition.Center, // position
    10,   // padding
    70,   // boxRadius
    10    // margin
  );
```
