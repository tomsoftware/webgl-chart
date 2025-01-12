import type { Color } from "../color";
import type { Context } from "../context";
import type { GpuText } from "../gpu-text";
import type { CallbackHandler } from "./callback-handler";
import { DimensionTypes, type RectDrawer } from "../rect-drawer";
import { Vector2 } from "../vector-2";

export enum VerticalPosition {
    Top,
    Center,
    Bottom
}

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
            [
                DimensionTypes.UseTransformation, DimensionTypes.UseBounds,
                DimensionTypes.UsePixel, DimensionTypes.UseBounds
            ],
            color,
            Vector2.zero,
            0,
            stripeWidth,

        );
    }

    /** add a label to the annotation */
    public addLabel(
        text: GpuText,
        color: Color,
        verticalPosition: VerticalPosition = VerticalPosition.Bottom,
        padding = 10,
        boxRadius = 70,
        margin = 0
    ) {
        this.drawCallback.then((context: Context) => {

            // calc size of text
            const w = text.getWidth(context).toPixel(context);
            const h = text.getHeight(context).toPixel(context);

            // adjust the position of the label
            let position = 0;
            switch (verticalPosition) {
                case VerticalPosition.Bottom:
                    position = 1;
                    break;
                case VerticalPosition.Top:
                    position = 0;
                    margin = -margin - (padding + h) * 2;
                    break;
                case VerticalPosition.Center:
                    position = 0.5;
                    margin = -(padding + h);
                    break;
            }

            // add label-box
            this.rectDrawer.addRect(
                new Vector2(this.x, position),
                new Vector2(w + padding, h + padding),
                [
                    DimensionTypes.UseTransformation, DimensionTypes.UseBounds,
                    DimensionTypes.UsePixel, DimensionTypes.UsePixel
                ],
                color,
                new Vector2(0, margin),
                0, 0,
                boxRadius,
            );

            // add label-text
            const textureInfo = this.rectDrawer.textureMap.addTexture(context, text);
            this.rectDrawer.addRect(
                new Vector2(this.x, position),
                new Vector2(w, h),
                [
                    DimensionTypes.UseTransformation, DimensionTypes.UseBounds,
                    DimensionTypes.UsePixel, DimensionTypes.UsePixel
                ],
                color,
                new Vector2(0, margin + padding),
                0, 0,
                0,
                textureInfo
            );
        });
    }
}
