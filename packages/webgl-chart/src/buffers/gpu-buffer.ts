import { GpuBufferView } from "./buffer-view";

export interface GpuBuffer {
    get data(): AllowSharedBufferSource;

    /** remove all items from the buffer */
    clear(): void;

    get length(): number;

    get count(): number;

    get dataVersion(): number;

    setVertexAttribPointer(
        gl: WebGLRenderingContext,
        variableLoc: GLint,
        angleExtension: ANGLE_instanced_arrays | null,
        bufferView: GpuBufferView
    ): void;
}
