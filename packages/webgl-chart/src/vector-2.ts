import type { Matrix3x3 } from "./matrix-3x3";
import type { IUniformValue } from "./uniform";

export class Vector2 implements IUniformValue{
    public x: number;
    public y: number;

    constructor(x?: number, y?: number) {
        this.x = x ?? 0;
        this.y = y ?? 0;
    }

    /** transforms a given 2d-vector with this matrix */
    public transform(transformation: Matrix3x3): Vector2 {

        const m = transformation.values;

        const x = this.x;
        const y = this.y;

        return new Vector2(
            m[0] * x + m[3] * y + m[6],
            m[1] * x + m[4] * y + m[7]
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

    /** subtract: this-v */
    public sub(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    public add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    public addValues(x: number, y: number) {
        return new Vector2(this.x + x, this.y + y);
    }

    public bindUniform(gl: WebGLRenderingContext, variableLoc: WebGLUniformLocation): void {
        gl.uniform2fv(variableLoc, this.values);
    }

    private numberToString(n: number): string {
        return n.toLocaleString(undefined, {
            useGrouping: false
          });
    }

    public toString() {
        return '{ x: ' + this.numberToString(this.x) + ' y: ' + this.numberToString(this.y) + ' }'
    }

    /** Zero Vector */
    public static readonly zero = new Vector2(0, 0);
}
