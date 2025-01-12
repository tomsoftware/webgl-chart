import type { Color } from "../color";
import type { Context } from "../context";
import type { CallbackHandler } from "./callback-handler";
import type { GpuText } from "../gpu-text";
import { DimensionTypes, type RectDrawer } from "../rect-drawer";
import { Vector2 } from "../vector-2";


export class HorizontalLineAnnotation {
    private rectDrawer: RectDrawer;
    private index: number;
    private drawCallback: CallbackHandler<Context>;

    public get y() {
        return this.rectDrawer.getRectPos(this.index).y;
    }

    public get lineThickness() {
        return this.rectDrawer.getRectSize(this.index).y;
    }

    public constructor(
        drawCallback: CallbackHandler<Context>,
        rectDrawer: RectDrawer,
        y: number, color: Color, stripeWidth: number, lineThickness: number
    ) {
        this.drawCallback = drawCallback;
        this.rectDrawer = rectDrawer;

        this.index = rectDrawer.addRect(
            new Vector2(0, y),
            new Vector2(1, lineThickness),
            color, 0,
            stripeWidth, 0,
            [
                DimensionTypes.UseBounds, DimensionTypes.UseTransformation,
                DimensionTypes.UseBounds, DimensionTypes.UsePixel
            ]
        );

    }

    /** add a label to the annotation */
    public addLabel(text: GpuText, color: Color, position = 0, padding = 10, boxRadius = 70) {
        this.drawCallback.then((context: Context) => {
            const w = text.getWidth(context).toPixel(context) + padding;
            const h = text.getHeight(context).toPixel(context) + padding;

            this.rectDrawer.addRect(
                new Vector2(position, this.y),
                new Vector2(w, h),
                color, boxRadius,
                0, 0,
                [
                    DimensionTypes.UseBounds, DimensionTypes.UseTransformation,
                    DimensionTypes.UsePixel, DimensionTypes.UsePixel
                ]
            );
        });
    }
}
