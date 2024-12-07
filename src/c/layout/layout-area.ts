import { Matrix3x3 } from "../matrix-3x3";
import { Vector2 } from "../vector-2";

export class LayoutArea {
    public left: number;
    public top: number;
    public width: number;
    public height: number;

    public get right(): number {
        return this.left + this.width;
    }

    public get bottom(): number {
        return this.top + this.height;
    }

    /** Top left corner */
    public get p0(): Vector2 {
        return new Vector2(this.left, this.top);
    }

    /** Top right corner */
    public get p1(): Vector2 {
        return new Vector2(this.right, this.top);
    }

    /** Bottom right corner */
    public get p2(): Vector2 {
        return new Vector2(this.right, this.bottom);
    }

    /** Bottom left corner */
    public get p3(): Vector2 {
        return new Vector2(this.left, this.bottom);
    }

    constructor(left: number, top: number, width: number, height: number) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }

    public shrink(value: number): LayoutArea {
        return new LayoutArea(
            this.left + value,
            this.top + value,
            Math.max(0, this.width - 2 * value),
            Math.max(0, this.height - 2 * value)
        );
    }

    public toMaxtrix(): Matrix3x3 {
        return Matrix3x3.translate(this.left, this.top);
    }

    /** returns a LayoutArea that is the intersection of this and another LayoutArea */
    public intersect(other: LayoutArea): LayoutArea {
        return LayoutArea.fromPos(
            Math.max(this.left, other.left),
            Math.max(this.top, other.top),
            Math.min(this.right, other.right),
            Math.min(this.bottom, other.bottom)
        );
    }

    public static fromPos(x1: number, y1: number, x2: number, y2: number): LayoutArea {
        return new LayoutArea(x1, y1, Math.max(0, x2 - x1), Math.max(y2 - y1));
    }
}
