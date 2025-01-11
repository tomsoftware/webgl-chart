import type { Color } from "../color";
import type { Context } from "../context";
import type { Scale } from "../scales/scale";
import type { LayoutNode } from "../layout/layout-node";
import { DimensionTypes, RectDrawer } from "../rect-drawer";
import { Vector2 } from "../vector-2";
import { Matrix3x3 } from "../matrix-3x3";
import { VerticalLineAnnotation } from "./vertical-line-annotation";
import { CallbackHandler } from "./callback-handler";
import { HorizontalLineAnnotation } from "./horizontal-line-annotation";

/** Define and draw annotations to a LayoutNode */
export class Annotations {
    private rectDrawer = new RectDrawer();
    // draw calls are resolved in next draw call
    private drawCallbacks: CallbackHandler<Context>[] = [];

    /** create a box annotation */
    public addBox(x1: number, y1: number, x2: number, y2: number, color: Color, radius: number = 0) {
        const w = x2 - x1;
        const h = y2 - y1;

        this.rectDrawer.addRect2(
            new Vector2(x1, y1),
            new Vector2(w, h),
            color, radius,
            0, 0,
            [
                DimensionTypes.UseTransformation, DimensionTypes.UseTransformation,
                DimensionTypes.UseTransformation, DimensionTypes.UseTransformation
            ]
        );
    }

    private createDrawCallback(): CallbackHandler<Context> {
        const newCallback = new CallbackHandler<Context>();
        this.drawCallbacks.push(newCallback);
        return newCallback;
    }

    /** create a vertical line annotation */
    public addVerticalLine(x: number, color: Color, stripeWidth = 0, lineThickness: number = 1) {
        return new VerticalLineAnnotation(
            this.createDrawCallback(), this.rectDrawer, 
            x, color, stripeWidth, lineThickness
        );
    }

    /** create a horizontal line annotation */
    public addHorizontalLine(y: number, color: Color, stripeWidth = 0, lineThickness: number = 1) {
        return new HorizontalLineAnnotation(
            this.createDrawCallback(), this.rectDrawer, 
            y, color, stripeWidth, lineThickness
        );
    }

    private doDrawCallbacks(context: Context) {
        const callbacks = this.drawCallbacks;
        this.drawCallbacks = [];

        for (const callback of callbacks) {
            callback.execute(context);
        }
    }

    /** render all annotation */
    public draw(context: Context, scaleX: Scale, scaleY: Scale, chartLayout: LayoutNode) {
        this.doDrawCallbacks(context);

        const chartArea = chartLayout?.getArea(context.layoutCache);

        const s = Matrix3x3.translate(-scaleX.min, -scaleY.max).scale(chartArea.width / scaleX.range,- chartArea.height / scaleY.range);
        const p = context.projectionMatrix;
        const l = chartArea.toMatrix();

        const m = p.multiply(l.values).multiply(s.values);

        this.rectDrawer.draw(context, chartLayout, m);
    }
}
