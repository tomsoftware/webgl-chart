import type { Context } from "../context";
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
        const h = this.label?.getHeight(context).toPixel(context) ?? 0;
        return new ScreenPosition(h + 10, ScreenUnit.Pixel);
    }

    public draw(context: Context, axisLayout: LayoutNode) {
        const area = axisLayout.getArea(context.layoutCache);

        // draw axis border
        if (this.possition === VerticalAxisPossition.Right) {
            context.drawLine(area.p0, area.p3, this.borderColor);
        }
        else {
            context.drawLine(area.p1, area.p2, this.borderColor);
        }

        if (this.label != null) {
            this.label.draw(context, axisLayout, new Matrix3x3().rotateDeg(90).translate(area.width / 2, area.height / 2));
        }
    }
}
