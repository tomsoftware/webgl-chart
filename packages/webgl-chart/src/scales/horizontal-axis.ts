import type { Context } from "../context";
import type { LayoutNode } from "../layout/layout-node";
import { ScreenPosition, ScreenUnit } from "../layout/screen-position";
import { AxisBase } from "./axis-base";
import { Matrix3x3 } from "../matrix-3x3";
import { Alignment } from "../alignment";
import { GpuLetterText } from "../texture/gpu-letter-text";
import { IHeightProvider } from "../layout/size-provider";
import { Font } from "../texture/font";
import { TextTextureGenerator } from "../texture/text-texture-generator";

export enum HorizontalAxisPosition {
    Top,
    Bottom
}

export class HorizontalAxis extends AxisBase implements IHeightProvider {
    public position: HorizontalAxisPosition = HorizontalAxisPosition.Bottom;

    public setPosition(position: HorizontalAxisPosition): HorizontalAxis {
        this.position = position;
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
        let tickLabelOffset: number;

        // draw axis border
        if (this.position === HorizontalAxisPosition.Bottom) {
            context.drawLine(area.p0, area.p1, this.borderColor);
            align = Alignment.centerBottom;
            tickLabelOffset = -context.pixelToScreenX(2);
        }
        else {
            context.drawLine(area.p2, area.p3, this.borderColor);
            align = Alignment.centerTop;
            tickLabelOffset = context.pixelToScreenX(2);
        }

        if (this.label != null) {
            this.label.draw(context, axisLayout, align, Matrix3x3.translate(0, tickLabelOffset));
        }

        // get font width
        const g = TextTextureGenerator.getCached('0', this.tickFont);
        const m = g.computerTextMetrics(context);

        const ticks = this.scale.calculateTicks(m.width, area.width * context.width, false);
        const positionScaling = area.width / this.scale.range;

        for (const tick of ticks) {
            const m = new Matrix3x3().translate((tick - this.scale.min) * positionScaling, 0);
            context.drawLine(area.p0.transform(m), area.p0p3(0.1).transform(m), this.tickColor);
            const text = new GpuLetterText(tick.toLocaleString(), this.tickFont)
                .setColor(this.tickColor);

            text.draw(context, axisLayout, Alignment.leftTop, m.translate(0, area.height * 0.5));
        
            if ((this.gridColor != null) && (chartArea != null)){
                context.drawLine(chartArea.p0.transform(m), chartArea.p3.transform(m), this.gridColor);
            }
        }
    }
    
}