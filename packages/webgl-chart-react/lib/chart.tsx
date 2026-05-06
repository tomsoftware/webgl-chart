import React, { useRef, useEffect } from 'react';
import { WebGlChart } from '@tomsoftware/webgl-chart';
import { ChartConfig } from './chart-config';

interface Props {
  data: ChartConfig;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  onBind?: (element: HTMLElement | null) => void;
}

const Chart: React.FC<Props> = ({ data, ariaLabel, ariaDescribedBy, onBind}) => {
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const webGlChart = useRef<WebGlChart | null>(null);

  useEffect(() => {
    const cav = chartCanvasRef.current;
    if (cav == null) {
      return;
    }

    console.debug('webgl-chart mounted');
    webGlChart.current = new WebGlChart();
    webGlChart.current.bind(cav);
    webGlChart.current.setMaxFrameRate(data.maxFrameRate);
    webGlChart.current.setRenderCallback((context) => {
      if (data == null || data.onRender == null) {
        return;
      }
      data.onRender(context);
    });

    if (onBind) {
      onBind(cav);
    }

    webGlChart.current.render();

    return () => {
      if (webGlChart.current == null) {
        return;
      }
      console.debug('webgl-chart unmounted!');
      webGlChart.current.dispose();
    };
  }, [data]);


  useEffect(() => {
    if (webGlChart.current == null) {
      return;
    }
    webGlChart.current.setMaxFrameRate(data.maxFrameRate);
  }, [data.maxFrameRate]);

  return (
    <canvas
      ref={chartCanvasRef}
      role="img"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    ></canvas>
  );
};

export default Chart;
