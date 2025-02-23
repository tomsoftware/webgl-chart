import type { IWidthProvider } from "../layout/horizontal-item";
import type { LayoutNode } from "../layout/layout-node";
import type { Context } from "../context";
import { Alignment } from "../alignment";
import { ScreenUnit, ScreenPosition } from "../layout/screen-position";
import { Matrix3x3 } from "../matrix-3x3";
import { AxisBase } from "./axis-base";
import { GpuLetterText } from "../texture/gpu-letter-text";

export enum VerticalAxisPosition {
    Left,
    Right
}

export class VerticalAxis extends AxisBase implements IWidthProvider {
    public position: VerticalAxisPosition = VerticalAxisPosition.Left;

    public setPosition(position: VerticalAxisPosition): VerticalAxis {
        this.position = position;
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
        if (this.position === VerticalAxisPosition.Right) {
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
        const positionScaling = area.height / this.scale.range;

        for (const tick of ticks) {
            const m = new Matrix3x3().translate(0, (this.scale.max - tick) * positionScaling);
            if (this.position === VerticalAxisPosition.Right) {
                context.drawLine(area.p0.transform(m), area.p0p1(0.1).transform(m), this.tickColor);
            }
            else {
                context.drawLine(area.p0p1(0.9).transform(m), area.p1.transform(m), this.tickColor);
            }
            const text = new GpuLetterText(tick.toLocaleString());
            text.draw(context, axisLayout, Alignment.leftTop, m.translate(area.width * tickLabelShift, 0));
        
            // draw grid lines
            if ((this.gridColor != null) && (chartArea != null)){
                context.drawLine(chartArea.p0.transform(m), chartArea.p1.transform(m), this.gridColor);
            }
        }
    }
}
