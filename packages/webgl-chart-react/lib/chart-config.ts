import { ChartRenderCallback } from "@tomsoftware/webgl-chart";

export class ChartConfig {
    public onRender: ChartRenderCallback | null = null;

    public setRenderCallback(callback: ChartRenderCallback): ChartConfig {
        this.onRender = callback;
        return this;
    }

    /** the max-framerate the chart is redrawn  */
    public maxFrameRate = 2 /* FPS */;
    
    /** set the maximum number of frames per second */
    public setMaxFrameRate(maxFrameRate: number) {
        this.maxFrameRate = maxFrameRate;
    }
}
