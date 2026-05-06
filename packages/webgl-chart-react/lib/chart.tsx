import React, { useRef, useEffect } from 'react';
import { ChartConfig } from './chart-config';
import { WebGLRenderer } from '@tomsoftware/webgl-lib';

interface Props {
  data: ChartConfig;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  onBind?: (element: HTMLElement | null) => void;
}

const Chart: React.FC<Props> = ({ data, ariaLabel, ariaDescribedBy, onBind}) => {
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const webGLRenderer = useRef<WebGLRenderer | null>(null);

  useEffect(() => {
    const cav = chartCanvasRef.current;
    if (cav == null) {
      return;
    }

    console.debug('webgl-chart mounted');
    webGLRenderer.current = new WebGLRenderer();
    webGLRenderer.current.bind(cav);
    webGLRenderer.current.setMaxFrameRate(data.maxFrameRate);
    webGLRenderer.current.setRenderCallback((context) => {
      if (data == null || data.onRender == null) {
        return;
      }
      data.onRender(context);
    });

    if (onBind) {
      onBind(cav);
    }

    webGLRenderer.current.render();

    return () => {
      if (webGLRenderer.current == null) {
        return;
      }
      console.debug('webgl-chart unmounted!');
      webGLRenderer.current.dispose();
    };
  }, [data]);


  useEffect(() => {
    if (webGLRenderer.current == null) {
      return;
    }
    webGLRenderer.current.setMaxFrameRate(data.maxFrameRate);
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
