# Layout System

The layout system in webgl-chart allows you to arrange graphical elements on the screen. It provides a flexible way to define the positioning and sizing of chart components like axes, legends, and data areas.

## How Layouts Work

Layouts are built using a tree of `LayoutNode` objects. Each node represents a rectangular area on the screen. The layout system calculates the positions and sizes of these areas based on the available space and the constraints defined by the layout types.

The layout calculation happens in two phases:
1. **Definition Phase**: You build the layout tree by adding layout nodes.
2. **Calculation Phase**: The `context.calculateLayout(baseCell)` method traverses the tree and computes the actual screen areas.

## Layout Elements

### LayoutCell

A `LayoutCell` is a basic container that can hold other layout nodes. It passes its entire area to all its children.

```ts
const baseContainer = new LayoutCell();
const childCell = baseContainer.addLayout(new LayoutCell());
```

> **Tip:** Use `LayoutCell` when you want to group multiple layouts together or when you need a stable reference to a specific area for drawing and event handling.

```ts
const base = new LayoutCell();
const row = base.addLayout(new HorizontalLayout());
const left = row.addRelativeCell(1);
const right = row.addRelativeCell(1);

// later in render loop
border.draw(context, left);
```
### HorizontalLayout

Arranges children horizontally. You can add fixed-width cells (based on content) or relative-width cells.

```ts
const horizontal = new HorizontalLayout();
const fixedCell = horizontal.addFixedCell([someWidthProvider]);
const relativeCell = horizontal.addRelativeCell(1); // takes remaining space
```

<example-horizontal-layout />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-horizontal-layout.vue)
</details>


### VerticalLayout

Arranges children vertically. Similar to `HorizontalLayout` but for vertical stacking.

```ts
const vertical = new VerticalLayout();
const fixedCell = vertical.addFixedCell([someHeightProvider]);
const relativeCell = vertical.addRelativeCell(1); // takes remaining space
```


<example-vertical-layout />
<details>
  <summary>Source</summary>

  @[code](../../examples/example-vertical-layout.vue)
</details>

### IntersectedLayout

Calculates the intersection area of multiple layout nodes. Useful when you need to draw something only where two or more layout regions overlap (e.g. a chart area that is constrained by both a row and a column layout).

```ts
const left = new LayoutCell();
const top = new LayoutCell();
const intersected = new IntersectedLayout(left, top);

// In the render callback you can draw into the intersection:
// border.draw(context, intersected);
```

> Example: draw a special marker only where the left and top regions overlap.

<example-intersected-layout />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-intersected-layout.vue)
</details>
