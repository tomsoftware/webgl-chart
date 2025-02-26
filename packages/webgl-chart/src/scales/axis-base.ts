import type { GpuText } from "../texture/gpu-text";
import { Scale } from "./scale";
import { Color } from "../color";

export class AxisBase {
    public label: GpuText | null;
    public scale: Scale;
    public borderColor: Color = Color.lightGray;
    public tickColor: Color = Color.black;
    public gridColor: Color | null = null;

    constructor(label?: GpuText | null, scale?: Scale | null) {
        this.scale = scale ?? new Scale(0, 1000);
        this.label = label ?? null;
    }

    public setBorderColor(color: Color) {
        this.borderColor = color;
        return this;
    }

    public setGridColor(color: Color | null) {
        this.gridColor = color;
        return this;
    }
}
