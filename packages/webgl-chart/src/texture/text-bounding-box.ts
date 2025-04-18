import { Matrix3x3 } from "../matrix-3x3";
import { Vector2 } from "../vector-2";

export class TextBoundingBox {
     /** left in pixels */
    public readonly left: number;
    /**  right in pixels */
    public readonly right: number;
    /** top in pixels */
    public readonly top: number;
    /**  bottom in pixels */
    public readonly bottom: number;

    /** width in pixels */
    public get width() {
        return this.right - this.left;
    }

    /** height in pixels */
    public get height() {
        return this.bottom - this.top;
    }

    public constructor(left: number = 0, top: number = 0, right: number = 0, bottom: number = 0) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }

    public static fromTextMetrics(textMetrics: TextMetrics | null = null): TextBoundingBox {
        if (textMetrics == null) {
            return new TextBoundingBox();
        } else {
            return new TextBoundingBox(
                textMetrics.actualBoundingBoxLeft,
                - textMetrics.fontBoundingBoxDescent,
                textMetrics.actualBoundingBoxRight,
                textMetrics.fontBoundingBoxAscent
            );
        }
    }

    public transform(transformation: Matrix3x3): TextBoundingBox {
        const p0 = new Vector2(this.left, this.top).transform(transformation);
        const p1 = new Vector2(this.right, this.top).transform(transformation);
        const p2 = new Vector2(this.left, this.bottom).transform(transformation);
        const p3 = new Vector2(this.right, this.bottom).transform(transformation);

        return new TextBoundingBox(
            Math.min(p0.x, p1.x, p2.x, p3.x),
            Math.min(p0.y, p1.y, p2.y, p3.y),
            Math.max(p0.x, p1.x, p2.x, p3.x),
            Math.max(p0.y, p1.y, p2.y, p3.y),
        );
    }
}
