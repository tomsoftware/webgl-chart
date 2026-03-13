# Event Handling

The `EventDispatcher` class allows you to handle user interactions such as mouse wheel zooming and panning (dragging) on chart elements.

## EventDispatcher

### Binding to an HTML Element

To bind the event dispatcher to an HTML element, use the `bind` method:

```ts
eventDispatcher.bind(htmlElement);
```

### Dispatching Events in the Render Loop

Call `dispatch` in your render callback to process queued events:

```ts
eventDispatcher.dispatch(context);
```

### Registering Event Handlers

Register event handlers using the `on` method:

```ts
// register events
eventDispatcher.on(EventTypes.Wheel, baseContainer, (e) => {
  if (Math.abs(e.wheelDelta) < 1) {
    return;
  }

  const s = (e.wheelDelta < 0) ? 1.2 : 0.8;
  mapPos = mapPos.scale(s, s);
});

eventDispatcher.on(EventTypes.Pan, baseContainer, (e) => {
  mapPos = mapPos.translate(e.panDeltaX, e.panDeltaY);
});
```

### Example
use mouse to pan and zoom the 'x'
<example-event-handling />

<details>
  <summary>Source</summary>

  @[code](../../examples/example-event-handling.vue)
</details>