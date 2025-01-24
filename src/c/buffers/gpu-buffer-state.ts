import type { GpuBuffer } from "./gpu-buffer";

export enum GlBufferTypes {
    ARRAY_BUFFER = WebGLRenderingContext.ARRAY_BUFFER,
    ELEMENT_ARRAY_BUFFER = WebGLRenderingContext.ELEMENT_ARRAY_BUFFER
}

export class GpuBufferState {
    private data: GpuBuffer;
    private buffer: WebGLBuffer | null = null;
    private lastDataVersion = -1;

    constructor(data: GpuBuffer) {
        this.data = data;
    }

    public dispose(gl: WebGLRenderingContext) {
        if (this.buffer == null) {
            return;
        }
        gl.deleteBuffer(this.buffer);
        this.buffer = null;
    }

    /** copy the value to the gpu */
    public setData(gl: WebGLRenderingContext, destination: GlBufferTypes): void {
        // check if the version of the data differs from the data in the buffer
        if (this.data.dataVersion == this.lastDataVersion) {
            return;
        }

        if (this.buffer == null) {
            this.buffer = gl.createBuffer();
        }

        gl.bindBuffer(destination, this.buffer);
        gl.bufferData(destination, this.data.data, gl.STATIC_DRAW);

        this.lastDataVersion = this.data.dataVersion;
    }

    /** activate buffer and use it for given variableLoc */
    public bindBuffer(gl: WebGLRenderingContext, destination: GlBufferTypes) {
        // Bind the id buffer.
        gl.bindBuffer(destination, this.buffer);
    }

    /** activate buffer and use it for given variableLoc */
    public setVertexAttribPointer(
        gl: WebGLRenderingContext,
        variableLoc: GLint,
        angleExtension: ANGLE_instanced_arrays | null,
        vertexAttribDivisor: number) {

        this.data.setVertexAttribPointer(
            gl,
            variableLoc,
            angleExtension,
            vertexAttribDivisor);
    }
}
