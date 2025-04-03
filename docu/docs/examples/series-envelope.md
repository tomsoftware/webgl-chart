# Envelope
This example uses the `SeriesEnvelope` to display area-charts between two series. Use `SeriesLine` or `SeriesPoint` to add outlines.

<example-series-envelope />

```ts
new SeriesEnvelope(time: GpuFloatBuffer, upper: GpuFloatBuffer | null = null, lower: GpuFloatBuffer | null = null)
    .setColor(upperColor: Color, lowerColor?: Color | null);
```


 Argument | Type    | Description 
----------|---------|---------
 time | GpuFloatBuffer    | Time Values
 upper | GpuFloatBuffer    | Upper values
 lower | GpuFloatBuffer    | Lower values



@[code](../../examples/example-series-envelope.vue)
