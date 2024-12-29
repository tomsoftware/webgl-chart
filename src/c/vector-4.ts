import type { IUniformValue } from "./unniform";

export class Vector4 implements IUniformValue {
    public values: Float32Array;

    constructor()
    constructor(values: Float32Array)
    constructor(a: number, b: number, c: number, d: number)
    constructor(values?: number | Float32Array, b?: number, c?: number, d?: number) {
    
        if (values == null) {
            this.values = new Float32Array(4);
        }
        else if (typeof (values) === 'number') {
            this.values = new Float32Array([values, b ?? 0, c ?? 0, d ?? 0]);
        }
        else {
            this.values = values;
        }
    }

    public bindUniform(gl: WebGLRenderingContext, variableLoc: WebGLUniformLocation): void {
        gl.uniform4fv(variableLoc, this.values);
    }

    public set(a: number, b: number, c: number, d: number): Vector4 {
        this.values[0] = a;
        this.values[1] = b;
        this.values[2] = c;
        this.values[3] = d;
        return this;
    }

    public setZero(): Vector4 {
        this.values[0] = 0;
        this.values[1] = 0;
        this.values[2] = 0;
        this.values[3] = 0;
        return this;
    }

    public setFromArray(color: number[]) {
        this.values[0] = color[0] ?? 0;
        this.values[1] = color[1] ?? 0;
        this.values[2] = color[2] ?? 0;
        this.values[3] = color[3] ?? 1;
        return this;
      }

    public static readonly zero = new Vector4(0, 0, 0, 0);
}
