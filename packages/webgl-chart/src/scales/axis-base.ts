import type { GpuText } from "../texture/gpu-text";
import { Scale } from "./scale";
import { Color } from "../color";
import { Font } from "../texture/font";

export class AxisBase {
    public label: GpuText | null;
    public scale: Scale;
    public borderColor: Color = Color.lightGray;
    public tickColor: Color = Color.black;
    public gridColor: Color | null = null;
    public tickFont: Font = new Font();

    constructor(label?: GpuText | null, scale?: Scale | null) {
        this.scale = scale ?? new Scale(0, 1000);
        this.label = label ?? null;
    }

    public setBorderColor(color: Color) {
        this.borderColor = color;
        return this;
    }

    /** set the color of the grid that is displayed with the scale inside the chart */
    public setGridColor(color: Color | null) {
        this.gridColor = color;
        return this;
    }

    /** set the font of the tick number */
    public setTickFont(font: Font) {
        this.tickFont = font;
        return this;
    }

    /** set the color of the tick line and the font of the tick number */
    public setTickColor(color: Color) {
        this.tickColor = color;
        return this;
    }
}
