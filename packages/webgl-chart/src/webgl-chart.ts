import { Context, WebGlRenderer } from '@tomsoftware/webgl-lib';

export type ChartRenderCallback = (context: ChartContext) => void;

export class ChartContext extends Context {
    // not yet known
}

/** WebGl chart class handles the rendering of the chart and caching */
export class WebGlChart extends WebGlRenderer {
    public setRenderCallback(callback: ChartRenderCallback): void {
        super.setRenderCallback(callback);
    }
}
