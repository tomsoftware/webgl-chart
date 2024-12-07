export interface IUniformValue {
    bindUniform(gl: WebGLRenderingContext, variableLoc: WebGLUniformLocation): void;
}