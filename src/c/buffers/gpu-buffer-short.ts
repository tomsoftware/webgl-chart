import { GpuBaseBuffer } from "./gpu-base-buffer";
import type { GpuBuffer } from "./gpu-buffer";

export class GpuShortBuffer extends GpuBaseBuffer<Uint16Array> implements GpuBuffer {

    constructor(size: number, componentsPerIteration = 1) {
        super(Uint16Array, size, componentsPerIteration);
    }

    public setVertexAttribPointer(gl: WebGLRenderingContext, variableLoc: GLint) {
        // Tell the attribute how to get data out of the (ARRAY_BUFFER)
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            variableLoc,
            this.componentsPerIteration,
            gl.UNSIGNED_SHORT,
            normalize,
            stride,
            offset
        );
    }

}
