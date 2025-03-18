import type { Alignment } from "../alignment";
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

    /** return a transformation to move the given part to the given Alignment */
    public getAligned(alignment: Alignment | null): Matrix3x3 {
        let x: number;
        let y: number;

        if (alignment == null) {
           return this.toMatrix();
        }
        else {
            x = alignment.alignX * this.width;
            y = alignment.alignY * this.height;
        }
        
        return this.toMatrix().translate(x, y);
    }

    /** return true if the given point is in the area */
    public contains(pos: Vector2): boolean {
        return pos.x >= this.left && pos.x <= this.right && pos.y >= this.top && pos.y <= this.bottom;
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

    /** scale the line between p0 and p1 */
    public p0p1(scale: number): Vector2 {
        return new Vector2(this.left + this.width * scale, this.top);
    }

    /** scale the line between p1 and p2 */
    public p1p2(scale: number): Vector2 {
        return new Vector2(this.right, this.top + this.height * scale);
    }

    /** scale the line between p2 and p3 */
    public p2p3(scale: number): Vector2 {
        return new Vector2(this.left + this.width * scale, this.bottom);
    }

    /** scale the line between p0 and p3 */
    public p0p3(scale: number): Vector2 {
        return new Vector2(this.left, this.top + this.height * scale);
    }

    constructor(left: number, top: number, width: number, height: number) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }

    /** Adjusts the margins of the layout area by reducing its width and height symmetrically.
     * If deltaY is not provided, it defaults to the value of deltaX */
    public adjustMargins(deltaX: number, deltaY?: number | null): LayoutArea {
        deltaY = deltaY ?? deltaX;
        return new LayoutArea(
            this.left + deltaX,
            this.top + deltaY,
            Math.max(0, this.width - 2 * deltaX),
            Math.max(0, this.height - 2 * deltaY)
        );
    }

    public toMatrix(): Matrix3x3 {
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
