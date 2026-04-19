/** The class can be the source of a webgl uniform value */
export interface IUniformValue {
    bindUniform(gl: WebGLRenderingContext, variableLoc: WebGLUniformLocation): void;
}