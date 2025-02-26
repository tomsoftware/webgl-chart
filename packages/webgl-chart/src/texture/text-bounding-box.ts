import type { Matrix3x3 } from "../matrix-3x3";
import { Vector2 } from "../vector-2";

export class TextBoundingBox {
    public left: number;
    public right: number;
    public top: number;
    public bottom: number;

    public get width() {
        return this.right - this.left;
    }

    public get height() {
        return this.bottom + this.top;
    }

    public constructor(textMetrics: TextMetrics | null = null) {
        if (textMetrics == null) {
            this.left = 0;
            this.right = 0;
            this.top = 0;
            this.bottom = 0;
        } else {
            this.left = textMetrics.actualBoundingBoxLeft;
            this.right = textMetrics.actualBoundingBoxRight;
            this.top = textMetrics.actualBoundingBoxDescent;
            this.bottom = textMetrics.actualBoundingBoxAscent;
        }
    }

    public increaseWidth(width: number) {
        this.right += width;
    }

    public transform(transformation: Matrix3x3): TextBoundingBox {
        const p0 = new Vector2(this.left, this.top).transform(transformation);
        const p1 = new Vector2(this.right, this.bottom).transform(transformation);

        const newBox = new TextBoundingBox();
        newBox.left = Math.min(p0.x, p1.x);
        newBox.top = Math.min(p0.y, p1.y);
        newBox.right = Math.max(p0.x, p1.x);
        newBox.bottom = Math.max(p0.y, p1.y);

        return newBox;
    }
}
