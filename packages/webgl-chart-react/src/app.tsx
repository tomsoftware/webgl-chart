import { useState } from 'react'
import { BasicChartLayout, Color, EventDispatcher, GpuFloatBuffer, LayoutCell, Scale, Series } from '@tomsoftware/webgl-chart';
import { ChartConfig } from './chart-config';
import React from 'react';
import Chart from './chart';

const App: React.FC = () => {
  const [] = useState(0)

  // generate time data
  const itemCount = 1000 * 60 * 60 / 4;
  const time = new GpuFloatBuffer(itemCount)
      .generate((i) => i * 0.001); // in seconds

  // generate series data
  const series1 = new Series(time)
      .generate((t) => 10 + Math.sin(t * 2 * Math.PI) * 10 + Math.random() * 2)
      .setColor(Color.blue)
      .setPointSize(5);


  // scales define the range that is shown by the axis
  const scaleX = new Scale(0, 1);
  const scaleY = new Scale(-15, 25);

  // handel events
  const eventDispatcher = new EventDispatcher();

  // define layout
  const baseContainer = new LayoutCell();

  // use a basic chart layout for arranging the chart-elements
  const basicLayout = new BasicChartLayout(eventDispatcher, baseContainer, scaleX);
  basicLayout.addYScale(scaleY, 'Value');
  basicLayout.xAxis.label?.setText('Time');

  // set render callback: here you need to define what elements you want to draw
  const myChart = new ChartConfig()
      .setRenderCallback((context) => {

        // arrange layout
        context.calculateLayout(baseContainer);

        // process events
        eventDispatcher.dispatch(context);

        // draw elements of chart-layout
        basicLayout.draw(context);

        // draw the series
        series1.drawLines(context, scaleX, scaleY, basicLayout.chartCell);
    });

  // set refresh rate
  myChart.setMaxFrameRate(60);

  function onBind(element: HTMLElement | null): void {
    // every event from the chart-element will be processed by our event dispatcher
    eventDispatcher.bind(element)
  }


  return (
    <>
      <h1>webgl-chart-react</h1>
      <Chart
        data={myChart}
        onBind={onBind}
        ariaLabel="My Chart"
        ariaDescribedby="chart-description"
      />
    </>
  )
}

export default App
