import { ChartRenderCallback } from '@tomsoftware/webgl-chart';
import { ref } from 'vue';

export class ChartConfig {
    public onRender: ChartRenderCallback | null = null;

    public setRenderCallback(callback: ChartRenderCallback): ChartConfig {
        this.onRender = callback;
        return this;
    }

    /** the max-framerate the chart is redrawn  */
    public maxFrameRate = ref<number>(2 /* FPS */);
    
    /** set the maximum number of frames per second */
    public setMaxFrameRate(maxFrameRate: number) {
        this.maxFrameRate.value = maxFrameRate;
    }
}
