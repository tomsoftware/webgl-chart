import { ref } from "vue";
import type { RenderCallback } from "../c/gpu-chart";

export class ChartConfig {
    public onRender: RenderCallback | null = null;

    public setRenderCallback(callback: RenderCallback): ChartConfig {
        this.onRender = callback;
        return this;
    }

    /** the max-framerate the chart is redrawn */
    public maxFrameRate = ref<number>(1);
    
    /** set the maximum number of frames per second */
    public setMaxFrameRate(maxFrameRate: number) {
        this.maxFrameRate.value = maxFrameRate;
    }
}
