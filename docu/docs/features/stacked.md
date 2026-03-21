# Stacked chart panels

This example shows multiple vertically stacked chart panels in a single canvas, with linked interaction and shared scaling.

<example-stacked />

<details>
  <summary>Source</summary>
  @[code](../../examples/example-stacked.vue)
</details>


## Implementation

- `VerticalLayout` arranges panels vertically   
   ```ts
   baseContainer.addLayout(new VerticalLayout(ScreenPosition.fromPixel(10)));
   ```
- each panel has its own `BasicChartLayout` + `LayoutCell`   
    ```ts
     new BasicChartLayout(eventDispatcher, this.layoutCell, scaleX);
    ```
    
- shared `scaleX` and `scaleY` provide coupling across panels (same time range and value limits) so all axis are drawn the same and events acts on all the same:
    ```ts
    c.draw(context, scaleX, scaleY);
    ```
