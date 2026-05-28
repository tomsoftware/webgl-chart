import type { LayoutNode, Context } from '@tomsoftware/webgl-lib';
import { Alignment, ScreenUnit, ScreenPosition, Matrix3x3, GpuLetterText,
    IWidthProvider, TextTextureGenerator } from '@tomsoftware/webgl-lib';
import { AxisBase } from './axis-base';

export enum VerticalAxisOrientation {
    Left,
    Right
}

export class VerticalAxis extends AxisBase implements IWidthProvider {
    public orientation: VerticalAxisOrientation = VerticalAxisOrientation.Left;

    public setOrientation(position: VerticalAxisOrientation): VerticalAxis {
        this.orientation = position;
        return this;
    }

    /** return the width of the label */
    protected getLabelWidth(context: Context) {
        if (this.label == null) {
            return ScreenPosition.NullSize;
        }

        return this.label.getWidth(context);
    }

    private cachedTickWidth: ScreenPosition = new ScreenPosition(0, ScreenUnit.Pixel);
    private cachedTicksKey: string = '';

    /** return the width we need to print the tick-values */
    protected getMaxTickWidth(context: Context) {
        // calculate ticks need to be drawn
        const ticksInfo = this.generateTicksInfo(context, 0.5);

        // can we use the cache
        if (this.cachedTicksKey === ticksInfo.hash) {
            return this.cachedTickWidth;
        }

        // check all ticks to find the max width
        let maxWidth = new ScreenPosition(0, ScreenUnit.Pixel);
        for (const t of ticksInfo.ticks) {
            // calculate the text-width
            const label = this.formatTickLabel(t);
            const tickGpuText = new GpuLetterText(label, this.tickFont);
            const tickWidth = tickGpuText.getWidth(context);
            if (maxWidth.value < tickWidth.value) {
                maxWidth = tickWidth;
            }
        }

        // cache value
        this.cachedTicksKey = ticksInfo.hash;
        this.cachedTickWidth = maxWidth;

        return maxWidth;
    }

    /** calculate the width need for this axis */
    public getWidth(context: Context): ScreenPosition {
        const labelWidth = this.getLabelWidth(context).toPixel(context);
        const tickTextWidth = this.getMaxTickWidth(context).toPixel(context);

        return new ScreenPosition(labelWidth + tickTextWidth + this.tickLength + this.tickTextPadding * 2 + this.labelPadding, ScreenUnit.Pixel);
    }

    private generateTicksInfo(context: Context, areaHeight: number) {
        // get font hight
        const generator = TextTextureGenerator.getCached('0', this.tickFont);
        const metric = generator.computerTextMetrics(context.textureContext);

        const ticks = this.scale.calculateTicks(metric.height, areaHeight * context.height * 1.5, true);

        return {
            metric,
            ticks,
            hash: ticks[0] + '#' + ticks[ticks.length - 1] + '#' + length
        }
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
        if (this.orientation === VerticalAxisOrientation.Right) {
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

        // calculate ticks
        const ticksInfo = this.generateTicksInfo(context, area.height);
        const positionScaling = area.height / this.scale.range;

        const tickLetterHightHalf = context.pixelToScreenY(ticksInfo.metric.height * 0.5);

        // draw every tick with label
        for (const tick of ticksInfo.ticks) {
            const yOffset = (this.scale.max - tick) * positionScaling;

            if (this.orientation === VerticalAxisOrientation.Right) {
                context.drawLine(area.p0.addValues(tickLength, yOffset), area.p0.addValues(0, yOffset), this.tickColor);
            }
            else {
                context.drawLine(area.p1.addValues(tickLength, yOffset), area.p1.addValues(0, yOffset), this.tickColor);
            }

            // draw tick text
            new GpuLetterText(this.formatTickLabel(tick))
                .setColor(this.tickColor)
                .draw(context, axisLayout, tickTextAlign, Matrix3x3.translate(tickTextSpacing, yOffset - tickLetterHightHalf));
        
            // draw grid lines
            if ((this.gridColor != null) && (chartArea != null)) {
                context.drawLine(chartArea.p0.addValues(0, yOffset), chartArea.p1.addValues(0, yOffset), this.gridColor);
            }
        }
    }
}
