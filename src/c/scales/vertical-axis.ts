import { Alignment } from "../alignment";
import type { Context } from "../context";
import { GpuText } from "../gpu-text";
import type { IWidthProvider } from "../layout/horizontal-item";
import type { LayoutNode } from "../layout/layout-node";
import { ScreenUnit, ScreenPosition } from "../layout/screen-position";
import { Matrix3x3 } from "../matrix-3x3";
import { AxisBase } from "./axis-base";

export enum VerticalAxisPossition {
    Left,
    Right
}

export class VerticalAxis extends AxisBase implements IWidthProvider {
    public possition: VerticalAxisPossition = VerticalAxisPossition.Left;

    public setPossition(possition: VerticalAxisPossition): VerticalAxis {
        this.possition = possition;
        return this;
    }

    public getWidth(context: Context): ScreenPosition {
        const h = this.label?.getWidth(context).toPixel(context) ?? 0;
        return new ScreenPosition(h + 70, ScreenUnit.Pixel);
    }

    public draw(context: Context, axisLayout: LayoutNode, chartLayout: LayoutNode | null = null) {
        const area = axisLayout.getArea(context.layoutCache);
        const chartArea = chartLayout?.getArea(context.layoutCache);

        let align: Alignment;
        let tickLabelShift: number;

        // draw axis border
        if (this.possition === VerticalAxisPossition.Right) {
            context.drawLine(area.p0, area.p3, this.borderColor);
            align = Alignment.rightCenter;
            tickLabelShift = 0.6;
        }
        else {
            context.drawLine(area.p1, area.p2, this.borderColor);
            align = Alignment.leftCenter;
            tickLabelShift = 0.4;
        }

        if (this.label != null) {
            this.label.draw(context, axisLayout, align);
        }

        const ticks = this.scale.calculateTicks();
        const positionScaleing = area.height / this.scale.range;

        for (const tick of ticks) {
            const m = new Matrix3x3().translate(0, tick * positionScaleing);
            if (this.possition === VerticalAxisPossition.Right) {
                context.drawLine(area.p0.transform(m), area.p0p1(0.1).transform(m), this.tickColor);
            }
            else {
                context.drawLine(area.p0p1(0.9).transform(m), area.p1.transform(m), this.tickColor);
            }
            const text = new GpuText(tick.toLocaleString());
            text.draw(context, axisLayout, Alignment.leftTop, m.translate(area.width * tickLabelShift, 0));
        
            // draw grid lines
            if ((this.gridColor != null) && (chartArea != null)){
                context.drawLine(chartArea.p0.transform(m), chartArea.p1.transform(m), this.gridColor);
            }
        }
    }
}
