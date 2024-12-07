import type { GpuBuffer } from "./gpu-buffer";

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
    public setData(gl: WebGLRenderingContext): void {
        if (this.buffer == null) {
            this.buffer = gl.createBuffer();
        }
        // check if the version of the data differs from the data in the buffer
        if (this.data.dataVersion == this.lastDataVersion) {
            return;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.data.data, gl.STATIC_DRAW);

        this.lastDataVersion = this.data.dataVersion;
    }

    /** activate buffer and use it for given variableLoc */
    public bindBuffer(gl: WebGLRenderingContext, variableLoc: GLint) {
        // Turn on the attribute
        gl.enableVertexAttribArray(variableLoc);

        // Bind the id buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        
        this.data.bindBuffer(gl, variableLoc);
        
    }
}
