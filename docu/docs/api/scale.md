# Scale

Scales are used to project data ranges onto the visible display area. They define the minimum and maximum values of an axis and provide functions for value transformation, zooming, and panning.

## Basics

A scale is created with a minimum and maximum value:

```ts
import { Scale } from '@tomsoftware/webgl-chart';

const scale = new Scale(0, 100);
```

## Properties

### `min` / `max`
The minimum and maximum values of the scale.

```ts
scale.min = 10;
scale.max = 90;
```

### `range`
The size of the value range (read‑only).

```ts
const rangeSize = scale.range; // 80
```

## Methods

### `mapFromRange(sourceMin, sourceValue, sourceMax)`
Maps a value from an external range into the scale’s internal range.

```ts
const value = scale.mapFromRange(0, 50, 100); // Maps 50 from [0,100] into the scale range
```

```ts
scale.pan(-0.2); // Shift scale to the left
```

### `zoom(value, position)`
Zooms the scale around a specific anchor point  
(position: 0 = left/bottom, 1 = right/top, 0.5 = center).

```ts
scale.zoom(0.2, 0.5); // Zoom in by 20% around the center
```

### `setRange(min, max)`
Sets a new range for the scale.

```ts
scale.setRange(0, 200);
```

## Event Handling

React to scale changes:

```ts
scale.on('changed', (changedScale) => {
    console.log('Scale changed:', changedScale.min, changedScale.max);
});
```

The `changed` event is triggered by calls to `pan()`, `zoom()`, or `setRange()`.
