import type { IUniformValue } from "./unniform";

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

}
