import type { Context, LayoutNode, IHeightProvider } from '@tomsoftware/webgl-lib';
import { ScreenPosition, ScreenUnit, Matrix3x3, Alignment, 
    GpuLetterText, TextTextureGenerator } from '@tomsoftware/webgl-lib';
import { AxisBase } from './axis-base';

export enum HorizontalAxisOrientation {
    Top,
    Bottom
}

export class HorizontalAxis extends AxisBase implements IHeightProvider {
    public orientation: HorizontalAxisOrientation = HorizontalAxisOrientation.Bottom;

    public setOrientation(orientation: HorizontalAxisOrientation): HorizontalAxis {
        this.orientation = orientation;
        return this;
    }
    /** return the height of the label */
    protected getLabelHeight(context: Context) {
        if (this.label == null) {
            return ScreenPosition.NullSize;
        }
        return this.label.getHeight(context);
    }

    /** return the width we need to print the tick-values */
    protected getTickHeight(context: Context) {
        const g = TextTextureGenerator.getCached('0', this.tickFont);
        const m = g.computerTextMetrics(context.textureContext);
        return m.height;
    }

    public getHeight(context: Context): ScreenPosition {
        const h = this.getLabelHeight(context).toPixel(context);
        const tickTextHeight = this.getTickHeight(context);
        return new ScreenPosition(h + tickTextHeight + this.tickLength + this.tickTextPadding * 2 + this.labelPadding, ScreenUnit.Pixel);
    }

    public draw(context: Context, axisLayout: LayoutNode, chartLayout: LayoutNode | null = null) {
        const area = axisLayout.getArea(context.layoutCache);
        const chartArea = chartLayout?.getArea(context.layoutCache);

        let align: Alignment;

        // draw axis border
        if (this.orientation === HorizontalAxisOrientation.Bottom) {
            context.drawLine(area.p0, area.p1, this.borderColor);
            align = Alignment.centerBottom;
        }
        else {
            context.drawLine(area.p2, area.p3, this.borderColor);
            align = Alignment.centerTop;
        }

        // draw axis label
        if (this.label != null) {
            this.label.draw(context, axisLayout, align);
        }

        // get font width
        const g = TextTextureGenerator.getCached('0', this.tickFont);
        const m = g.computerTextMetrics(context.textureContext);

        const ticks = this.scale.calculateTicks(m.width, area.width * context.width, false);
        const positionScaling = area.width / this.scale.range;

        const tickLength = context.pixelToScreenY(this.tickLength);
        const tickTextSpacing = context.pixelToScreenY(this.tickLength + this.tickTextPadding);

        // draw every tick with label
        for (const tick of ticks) {
            const xOffset = (tick - this.scale.min) * positionScaling;

            // draw tick line
            context.drawLine(area.p0.addValues(xOffset, 0), area.p0.addValues(xOffset, tickLength), this.tickColor);

            // draw tick text
            const text = new GpuLetterText(this.formatTickLabel(tick), this.tickFont)
                .setColor(this.tickColor);

            // get the text-width to center align the text to the tick-line
            const tickLetterWidthHalf = context.pixelToScreenY(text.getAxisAlignedBoundingBox(context).width * 0.5);
            text.draw(context, axisLayout, Alignment.leftTop, Matrix3x3.translate(xOffset - tickLetterWidthHalf, tickTextSpacing));
        
            // draw grid
            if ((this.gridColor != null) && (chartArea != null)){
                context.drawLine(chartArea.p0.addValues(xOffset, 0), chartArea.p3.addValues(xOffset, 0), this.gridColor);
            }
        }
    }
    
}