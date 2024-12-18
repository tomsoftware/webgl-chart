export interface GpuBuffer {
    get data(): AllowSharedBufferSource;
    clear(): void;
    get length(): number;
    get count(): number;
    get dataVersion(): number;
    setVertexAttribPointer(gl: WebGLRenderingContext, variableLoc: GLint): void;
}
