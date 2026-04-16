# Rolling and sliding window

A `GpuRingBuffer` Ring Buffer (also called a circular buffer) is a fixed‑size memory region that continuously overwrites its oldest values.
When the write pointer reaches the end of the buffer, it wraps back to index `0`.
This makes it ideal for **rolling charts**, **real‑time plots**, and **oscilloscope‑style visualizations** where only a fixed‑width window of recent data is displayed.

**Example:**
Buffer size = `6`  
Incoming values = `[1, 2, 3, 4, 5, 6, 7, 8, 9]`  
Physical buffer content = `[7, 8, 9, 4, 5, 6]`

## Rendering Artifacts When Drawing Lines
When a line chart is rendered directly from a ring buffer, two common artifacts can appear.
Both are caused by the physical memory layout no longer matching the logical order of the data.


### Unwanted Connection Between Logical Last and Logical First Value

After wrapping, the buffer might look like:

`[7, 8, 9, 4, 5, 6]`

A *LINE_STRIP* will connect every adjacent physical element, including: **9 -> 4**.

This creates a false line segment that does not exist in the logical time series.


<example-buffer-ring-breaking />
<details>
  <summary>Source</summary>

  @[code](../../examples/example-buffer-ring-breaking.vue)
</details>


#### Solution
Enable `breakAfterWritePosition`

```ts
const dataA = new GpuRingBuffer('float32', 100)
  .setBreakAfterWritePosition(true);
```

This inserts a `NaN` at the write position, causing the line to break at the wrap point.

`[7, 8, 9, NaN, 5, 6]`

This inserts a NaN at the write position, causing the line to break at the wrap point.

`[7, 8, 9, NaN, 5, 6]`



### Missing Connection at the Wrap (Gap Between Oldest and Newest Value)
The opposite artifact:
Because the data wraps, there is no physical adjacency between the last logical value and the first logical value.

```
[7, 8, 9, … , 5, 6]
```

There is no line from **6 -> 7**, which results in a visible gap.

This gap is correct for rolling charts - but only if it is intentional.

<example-buffer-ring-wrapping />
<details>
  <summary>Source</summary>

  @[code](../../examples/example-buffer-ring-wrapping.vue)
</details>


#### Solution A
If you want a continuous line across the wrap, you can enable:

```ts
const dataA = new GpuRingBuffer('float32', 100)
  .setCopyLastValueToBeginning(true);
```

This duplicates the last written value `buffer[buffer.length - 1]` at index `0`, producing a smooth visual continuation:

`[7, 8, 9, … , 5, 6, 7]`

This avoids unwanted gap in the line

> **Remark:** If you enable `copyLastValueToBeginning` on the value buffer, you must also enable it on the corresponding time buffer. Otherwise, the two buffers will end up with different item counts, and the time/value pairs will no longer align correctly.


#### Solution B
Enable `lineLoop` on the `SeriesLine`

```ts
const seriesLineLoop = new SeriesLine(time, data)
  .setLineLoop(true);
```

This causes the `SeriesLine` to use `gl.LINE_LOOP`, which connects the last value back to the first.

> **Remark**: Depending on the graph you want to draw, you may need to disable `breakAfterWritePosition` on the `GpuRingBuffer` to avoid connecting start and end before the buffer is fully filled or enable `lineLoop` only after the buffer is complete.
