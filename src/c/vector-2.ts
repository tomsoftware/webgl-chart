import type { Matrix3x3 } from "./matrix-3x3";

export class Vector2 {
    public x: number;
    public y: number;

    constructor(x?: number, y?: number) {
        this.x = x ?? 0;
        this.y = y ?? 0;
    }

    /** transformes a given 2d-vector with this matrix */
    public transform(tansformation: Matrix3x3): Vector2 {

        const m = tansformation.values;

        const x = this.x;
        const y = this.y;

        const w = 1 / (m[2] * x + m[5] * y + m[8]);

        return new Vector2(
            (m[0] * x + m[3] * y + m[6]) * w,
            (m[1] * x + m[4] * y + m[7]) * w
        );
    }

    public get values(): number[] {
        return [this.x, this.y];
    }

    public scale(sx: number, sy? : number): Vector2 {
        if (sy == null) {
            sy = sx;
        }

        return new Vector2(this.x * sx, this.y * sy);
    }
}
