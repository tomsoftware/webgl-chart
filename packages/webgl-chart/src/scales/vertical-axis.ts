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
    protected getLabelWidth(context: Context) {
        if (this.label == null) {
            return ScreenPosition.NullSize;
        }

        return this.label.getWidth(context);
    }

    /** return the width we need to print the tick-values */
    protected getTickWidth(context: Context) {
        const g = TextTextureGenerator.getCached('0', this.tickFont);
        const m = g.computerTextMetrics(context);

        const ticks = this.scale.calculateTicks(m.height, 0.5 * context.width, true);

        // get some samples to measure
        const tick1 = ticks[0].toLocaleString();
        const tick2 = ticks[ticks.length - 1].toLocaleString();

        // find the tick-text with the most chars
        const maxTickText = (tick1.length > tick2.length) ? tick1: tick2;

        // calculate the text-width
        const tickGpuText = new GpuLetterText(maxTickText, this.tickFont);
        return tickGpuText.getWidth(context);
    }

    /** calculate the width need for this axis */
    public getWidth(context: Context): ScreenPosition {
        const labelWidth = this.getLabelWidth(context).toPixel(context);
        const tickTextWidth = this.getTickWidth(context).toPixel(context);

        return new ScreenPosition(labelWidth + tickTextWidth + this.tickLength + this.tickTextPadding * 2 + this.labelPadding, ScreenUnit.Pixel);
    }

    public draw(context: Context, axisLayout: LayoutNode, chartLayout: LayoutNode | null = null) {
        const area = axisLayout.getArea(context.layoutCache);
        const chartArea = chartLayout?.getArea(context.layoutCache);
        //const labelWidth = this.getLabelWidth(context).toNormalized(context);

        let labelAlign: Alignment;
        let tickTextAlign: Alignment;
        let tickTextSpacing: number;
        let tickLength : number;
        let labelPadding: number;

        // draw axis border
        if (this.position === VerticalAxisPosition.Right) {
            context.drawLine(area.p0, area.p3, this.borderColor);
            labelAlign = Alignment.rightCenter;
            tickTextAlign = Alignment.leftTop;
            tickTextSpacing = context.pixelToScreenY(this.tickLength + this.tickTextPadding);
            tickLength = context.pixelToScreenY(this.tickLength);
            labelPadding = context.pixelToScreenY(-this.labelPadding);
        }
        else {
            context.drawLine(area.p1, area.p2, this.borderColor);
            labelAlign = Alignment.leftCenter;
            tickTextAlign = Alignment.rightTop;
            tickTextSpacing = context.pixelToScreenY(- this.tickLength - this.tickTextPadding);
            tickLength = context.pixelToScreenY(-this.tickLength);
            labelPadding = context.pixelToScreenY(this.labelPadding);
        }

        // draw axis label
        if (this.label != null) {
            this.label.draw(context, axisLayout, labelAlign, Matrix3x3.translate(labelPadding, 0));
        }

        // get font hight
        const g = TextTextureGenerator.getCached('0', this.tickFont);
        const m = g.computerTextMetrics(context);

        // calculate ticks
        const ticks = this.scale.calculateTicks(m.height, area.height * context.width, true);
        const positionScaling = area.height / this.scale.range;

        // draw every tick with label
        for (const tick of ticks) {
            const yOffset = (this.scale.max - tick) * positionScaling;

            if (this.position === VerticalAxisPosition.Right) {
                context.drawLine(area.p0.addValues(tickLength, yOffset), area.p0.addValues(0, yOffset), this.tickColor);
            }
            else {
                context.drawLine(area.p1.addValues(tickLength, yOffset), area.p1.addValues(0, yOffset), this.tickColor);
            }

            // draw tick text
            new GpuLetterText(tick.toLocaleString())
                .setColor(this.tickColor)
                .draw(context, axisLayout, tickTextAlign, Matrix3x3.translate(tickTextSpacing, yOffset));
        
            // draw grid lines
            if ((this.gridColor != null) && (chartArea != null)) {
                context.drawLine(chartArea.p0.addValues(0, yOffset), chartArea.p1.addValues(0, yOffset), this.gridColor);
            }
        }
    }
}
