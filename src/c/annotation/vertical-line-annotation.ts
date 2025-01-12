import type { Color } from "../color";
import type { Context } from "../context";
import type { GpuText } from "../gpu-text";
import type { CallbackHandler } from "./callback-handler";
import { DimensionTypes, type RectDrawer } from "../rect-drawer";
import { Vector2 } from "../vector-2";

export class VerticalLineAnnotation {
    private rectDrawer: RectDrawer;
    private index: number;
    private drawCallback: CallbackHandler<Context>;

    public get x() {
        return this.rectDrawer.getRectPos(this.index).x;
    }

    public get lineThickness() {
        return this.rectDrawer.getRectSize(this.index).x;
    }

    public constructor(
        drawCallback: CallbackHandler<Context>,
        rectDrawer: RectDrawer,
        x: number, color: Color, stripeWidth: number, lineThickness: number
    ) {
        this.drawCallback = drawCallback;
        this.rectDrawer = rectDrawer;

        this.index = rectDrawer.addRect(
            new Vector2(x, 0),
            new Vector2(lineThickness, 1),
            color, 0,
            0, stripeWidth,
            [
                DimensionTypes.UseTransformation, DimensionTypes.UseBounds,
                DimensionTypes.UsePixel, DimensionTypes.UseBounds
            ]
        );

    }

    /** add a label to the annotation */
    public addLabel(text: GpuText, color: Color, position = 1, padding = 10, boxRadius = 70) {
        this.drawCallback.then((context: Context) => {
            const w = text.getWidth(context).toPixel(context) + padding;
            const h = text.getHeight(context).toPixel(context) + padding;

            this.rectDrawer.addRect(
                new Vector2(this.x, position),
                new Vector2(w, h),
                color, boxRadius,
                0, 0,
                [
                    DimensionTypes.UseTransformation, DimensionTypes.UseBounds,
                    DimensionTypes.UsePixel, DimensionTypes.UsePixel
                ]
            );
        });
    }
}
