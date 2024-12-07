import type { Context } from "../context";
import type { IHeightProvider } from "../layout/vertical-item";
import type { LayoutNode } from "../layout/layout-node";
import { ScreenPosition, ScreenUnit } from "../layout/screen-position";
import { AxisBase } from "./axis-base";
import { Matrix3x3 } from "../matrix-3x3";

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
        return new ScreenPosition(h + 10, ScreenUnit.Pixel);
    }

    public draw(context: Context, axisLayout: LayoutNode) {
        const area = axisLayout.getArea(context.layoutCache);

        // draw axis border
        if (this.possition === HorizontalAxisPossition.Bottom) {
            context.drawLine(area.p0, area.p1, this.borderColor);
        }
        else {
            context.drawLine(area.p2, area.p3, this.borderColor);
        }

        if (this.label != null) {
            this.label.draw(context, axisLayout, new Matrix3x3().translate(area.width / 2, area.height / 2));
        }

        const ticks = this.scale.calculateTicks();
        const positionScaleing = area.width / this.scale.range;

        for (const tick of ticks) {
            const m = new Matrix3x3().translate(tick * positionScaleing, 0);
            context.drawLine(area.p0.transform(m), area.p3.transform(m), this.tickColor);
        }
    }
    
}