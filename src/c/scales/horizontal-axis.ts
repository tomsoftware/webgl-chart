import type { Context } from "../context";
import type { IHeightProvider } from "../layout/vertical-item";
import type { LayoutNode } from "../layout/layout-node";
import { ScreenPosition, ScreenUnit } from "../layout/screen-position";
import { AxisBase } from "./axis-base";
import { Matrix3x3 } from "../matrix-3x3";
import { GpuText } from "../gpu-text";
import { Alignment } from "../alignment";

export enum HorizontalAxisPossition {
    Top,
    Bottom
}


export class HorizontalAxis extends AxisBase implements IHeightProvider{
    public possition: HorizontalAxisPossition = HorizontalAxisPossition.Bottom;

    public setPossition(possition: HorizontalAxisPossition): HorizontalAxis {
        this.possition = possition;
        return this;
    }

    public getHeight(context: Context): ScreenPosition {
        const h = this.label?.getHeight(context).toPixel(context) ?? 0;
        return new ScreenPosition(h + 40, ScreenUnit.Pixel);
    }

    public draw(context: Context, axisLayout: LayoutNode, chartLayout: LayoutNode | null = null) {
        const area = axisLayout.getArea(context.layoutCache);
        const chartArea = chartLayout?.getArea(context.layoutCache);

        let align: Alignment;

        // draw axis border
        if (this.possition === HorizontalAxisPossition.Bottom) {
            context.drawLine(area.p0, area.p1, this.borderColor);
            align = Alignment.centerBottom;
        }
        else {
            context.drawLine(area.p2, area.p3, this.borderColor);
            align = Alignment.centerTop;
        }

        if (this.label != null) {
            this.label.draw(context, axisLayout, align);
        }

        const ticks = this.scale.calculateTicks();
        const positionScaleing = area.width / this.scale.range;

        for (const tick of ticks) {
            const m = new Matrix3x3().translate(tick * positionScaleing, 0);
            context.drawLine(area.p0.transform(m), area.p0p3(0.1).transform(m), this.tickColor);
            const text = new GpuText(tick.toLocaleString());
            text.draw(context, axisLayout, Alignment.leftTop, m.translate(0, area.height * 0.5));
        
            if ((this.gridColor != null) && (chartArea != null)){
                context.drawLine(chartArea.p0.transform(m), chartArea.p3.transform(m), this.gridColor);
            }
        }
    }
    
}