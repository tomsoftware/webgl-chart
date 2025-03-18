import type { LayoutNode } from "../layout/layout-node";
import type { Context } from "../context";
import { Alignment } from "../alignment";
import { ScreenUnit, ScreenPosition } from "../layout/screen-position";
import { Matrix3x3 } from "../matrix-3x3";
import { AxisBase } from "./axis-base";
import { GpuLetterText } from "../texture/gpu-letter-text";
import { IWidthProvider } from "../layout/size-provider";
import { TextTextureGenerator } from "../texture/text-texture-generator";

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

    /** return the width of the label */
    private getLabelWidth(context: Context) {
        if (this.label == null) {
            return ScreenPosition.NullSize;
        }

        return this.label.getWidth(context);
    }

    /** return the width we need to print the tick-values */
    private getTickWidth(context: Context) {
        const g = TextTextureGenerator.getCached('0', this.tickFont);
        const m = g.computerTextMetrics(context);

        const ticks = this.scale.calculateTicks(m.height, 0.5 * context.width, true);

        const tick1 = ticks[0].toLocaleString();
        const tick2 = ticks[ticks.length - 1].toLocaleString();

        const maxTickText = tick1.length > tick2.length ? tick1: tick2;

        const tickGpuText = new GpuLetterText(maxTickText);
        return tickGpuText.getWidth(context);
    }

    /** calculate the width need for this axis */
    public getWidth(context: Context): ScreenPosition {
        const labelWidth = this.getLabelWidth(context).toPixel(context);
        const tickTextWidth = this.getTickWidth(context).toPixel(context);

        return new ScreenPosition(1.2 * (labelWidth * 2 + tickTextWidth), ScreenUnit.Pixel);
    }

    public draw(context: Context, axisLayout: LayoutNode, chartLayout: LayoutNode | null = null) {
        const area = axisLayout.getArea(context.layoutCache);
        const chartArea = chartLayout?.getArea(context.layoutCache);
        const labelWidth = this.getLabelWidth(context).toNormalized(context);

        let align: Alignment;
        let tickLabelOffset: number;
        let labelOffset: number;

        // draw axis border
        if (this.position === VerticalAxisPosition.Right) {
            context.drawLine(area.p0, area.p3, this.borderColor);
            align = Alignment.rightCenter;
            tickLabelOffset = -context.pixelToScreenX(2);
            labelOffset = area.width - labelWidth;
        }
        else {
            context.drawLine(area.p1, area.p2, this.borderColor);
            align = Alignment.leftCenter;
            tickLabelOffset = context.pixelToScreenX(2);
            labelOffset = labelWidth;
        }

        if (this.label != null) {
            this.label.draw(context, axisLayout, align, Matrix3x3.translate(tickLabelOffset, 0));
        }

        // get font hight
        const g = TextTextureGenerator.getCached('0', this.tickFont);
        const m = g.computerTextMetrics(context);

        // calculate ticks
        const ticks = this.scale.calculateTicks(m.height, area.height * context.width, true);

        const positionScaling = area.height / this.scale.range;

        for (const tick of ticks) {
            const m = new Matrix3x3().translate(0, (this.scale.max - tick) * positionScaling);
            if (this.position === VerticalAxisPosition.Right) {
                context.drawLine(area.p0.transform(m), area.p0p1(0.1).transform(m), this.tickColor);
            }
            else {
                context.drawLine(area.p0p1(0.9).transform(m), area.p1.transform(m), this.tickColor);
            }

            const text = new GpuLetterText(tick.toLocaleString())
                .setColor(this.tickColor);
            text.draw(context, axisLayout, Alignment.centerTop, m.translate(tickLabelOffset, 0));
        
            // draw grid lines
            if ((this.gridColor != null) && (chartArea != null)){
                context.drawLine(chartArea.p0.transform(m), chartArea.p1.transform(m), this.gridColor);
            }
        }
    }
}
