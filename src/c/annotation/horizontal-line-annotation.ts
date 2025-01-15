import type { Color } from "../color";
import type { Context } from "../context";
import type { CallbackHandler } from "./callback-handler";
import type { GpuText } from "../texture/gpu-text";
import { DimensionTypes, type RectDrawer } from "../rect-drawer";
import { Vector2 } from "../vector-2";

export enum HorizontalPosition {
    Left,
    Center,
    Right
}

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
            [
                DimensionTypes.UseBounds, DimensionTypes.UseTransformation,
                DimensionTypes.UseBounds, DimensionTypes.UsePixel
            ],
            color, 
            Vector2.zero,
            0, stripeWidth
        );

    }

    /** add a label to the annotation */
    public addLabel(
        text: GpuText,
        color: Color,
        horizontalPosition: HorizontalPosition = HorizontalPosition.Left,
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
            switch (horizontalPosition) {
                case HorizontalPosition.Left:
                    position = 0;
                    break;
                case HorizontalPosition.Right:
                    position = 1;
                    margin = -margin - (padding + w) * 2;
                    break;
                case HorizontalPosition.Center:
                    position = 0.5;
                    margin = -(padding + w);
                    break;
            }

            // add label-box
            this.rectDrawer.addRect(
                new Vector2(position, this.y),
                new Vector2(w + padding, h + padding),
                [
                    DimensionTypes.UseBounds, DimensionTypes.UseTransformation,
                    DimensionTypes.UsePixel, DimensionTypes.UsePixel
                ],
                color,
                new Vector2(margin, 0),
                0, 0,
                boxRadius
            );

            // add label-text
            const textureInfo = this.rectDrawer.textureMap.addTexture(context, text);
            this.rectDrawer.addRect(
                new Vector2(position, this.y),
                new Vector2(w, h),
                [
                    DimensionTypes.UseBounds, DimensionTypes.UseTransformation,
                    DimensionTypes.UsePixel, DimensionTypes.UsePixel
                ],
                text.color,
                new Vector2(margin + padding, 0),
                0, 0,
                0,
                textureInfo
            );
        });
    }
}
