import React, { useRef, useEffect } from 'react';
import { GpuChart } from '@tomsoftware/webgl-chart';
import { ChartConfig } from './chart-config';

interface Props {
  data: ChartConfig;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  onBind?: (element: HTMLElement | null) => void;
}

const Chart: React.FC<Props> = ({ data, ariaLabel, ariaDescribedBy, onBind}) => {
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const gpuChart = useRef<GpuChart | null>(null);

  useEffect(() => {
    const cav = chartCanvasRef.current;
    if (cav == null) {
      return;
    }

    console.debug('webgl-chart mounted');
    gpuChart.current = new GpuChart();
    gpuChart.current.bind(cav);
    gpuChart.current.setMaxFrameRate(data.maxFrameRate);
    gpuChart.current.setRenderCallback((context) => {
      if (data == null || data.onRender == null) {
        return;
      }
      data.onRender(context);
    });

    if (onBind) {
      onBind(cav);
    }

    gpuChart.current.render();

    return () => {
      if (gpuChart.current == null) {
        return;
      }
      console.debug('webgl-chart unmounted!');
      gpuChart.current.dispose();
    };
  }, [data]);


  useEffect(() => {
    if (gpuChart.current == null) {
      return;
    }
    gpuChart.current.setMaxFrameRate(data.maxFrameRate);
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
