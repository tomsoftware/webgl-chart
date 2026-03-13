# Introduction

Creating a chart with *WebGl-Chart* involves two main steps:

## Setup

The setup process is executed only once before the chart can be drawn. All steps are optional and include:

- Defining scales
- Setting up axes
- Adding data and annotations
- Setting up [event-handler](event-handling.md)
- Designing the [layout](layout.md)
- [Creating texts](draw-text.md) and legends

## Rendering

Rendering occurs every time the chart needs to be updated, for example, due to user interactions, resizing of the chart element, or data changes. Within the [setRenderCallback](renderer.md) callback, you can perform any desired actions, such as:

- Calculating the [layout](layout.md)
- Processing [events](event-handling.md)
- Drawing axes
- [Drawing texts](draw-text.md)
- Visualizing data and annotations
