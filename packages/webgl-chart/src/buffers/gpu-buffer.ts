export interface GpuBuffer {
    get data(): AllowSharedBufferSource;
    clear(): void;
    get length(): number;
    get count(): number;
    get dataVersion(): number;
    setVertexAttribPointer(
        gl: WebGLRenderingContext,
        variableLoc: GLint,
        angleExtension: ANGLE_instanced_arrays | null,
        vertexAttribDivisor: number
    ): void;
}
