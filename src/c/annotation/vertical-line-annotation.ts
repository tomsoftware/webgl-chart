import type { Color } from "../color";
import type { Context } from "../context";
import type { GpuText } from "../gpu-text";
import { DimensionTypes, type RectDrawer } from "../rect-drawer";
import { Vector2 } from "../vector-2";

export class VerticalLineAnnotation {
    private rectDrawer: RectDrawer;
    private index: number;
    private drawCallback: Promise<Context>;

    public get x() {
        return this.rectDrawer.getRectPos(this.index).x;
    }

    public get lineThickness() {
        return this.rectDrawer.getRectSize(this.index).x;
    }

    public constructor(drawCallback: Promise<Context>, rectDrawer: RectDrawer, index: number) {
        this.drawCallback = drawCallback;
        this.rectDrawer = rectDrawer;
        this.index = index;
    }

    /** add a label to the annotation */
    public addLabel(text: GpuText, color: Color) {
        this.drawCallback.then((context: Context) => {
            const w = text.getWidth(context).toNormalized(context);
            const h = text.getHeight(context).toNormalized(context);

            this.rectDrawer.addRect(
                new Vector2(this.x, 0),
                new Vector2(w, h),
                color, 0,
                0, 0,
                [0, DimensionTypes.UseBounds, DimensionTypes.UseAbsolute, DimensionTypes.UseAbsolute]
            );
        });
    }
}
