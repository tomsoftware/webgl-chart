import type { IUniformValue } from "./uniform";

export class GpuNumber implements IUniformValue {
    private value: number;

    constructor(values: number) {
        this.value = values;
    }

    public set(v: number) {
        this.value = v;
    }

    public bindUniform(gl: WebGLRenderingContext, variableLoc: WebGLUniformLocation) {
        gl.uniform1f(variableLoc, this.value);
    }

    /** bound the current value to a min-max range */
    public bound(min: number, max: number): GpuNumber {
        this.set(Math.max(min, Math.min(max, this.value)));

        return this;
    }

    /** bound the current value to a min-max range given by a array[min, max] */
    public boundFromArray(minMax: number[]): GpuNumber {
        this.set(Math.max(minMax[0], Math.min(minMax[1], this.value)));

        return this;
    }
}
