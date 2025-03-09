import { GpuBaseBuffer } from "./gpu-base-buffer";
import type { GpuBuffer } from "./gpu-buffer";

export class GpuBufferMatrix3x3 extends GpuBaseBuffer<Float32Array> implements GpuBuffer {

    /** return a view of the buffer with the current data */
    public get data() {
        return this.buffer.subarray(this.bufferOffset, this.bufferEnd);
    }

    constructor(size: number) {
        super(Float32Array, size, 'matrix', 9);
    }

    public setVertexAttribPointer(
        gl: WebGLRenderingContext,
        variableLoc: GLint,
        angleExtension: ANGLE_instanced_arrays | null,
        vertexAttribDivisor: number
    ): void {
        
        gl.enableVertexAttribArray(variableLoc + 0);
        gl.enableVertexAttribArray(variableLoc + 1);
        gl.enableVertexAttribArray(variableLoc + 2);

        const bytesPerMatrix = 4 * 3 * 3;

        gl.vertexAttribPointer(
            variableLoc + 0,  // location
            3,                // size (num values to pull from buffer per iteration)
            gl.FLOAT,         // type of data in buffer
            false,            // normalize
            bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
            0,           // offset in buffer
        );

        gl.vertexAttribPointer(
            variableLoc + 1,  // location
            3,                // size (num values to pull from buffer per iteration)
            gl.FLOAT,         // type of data in buffer
            false,            // normalize
            bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
            4 * 3,           // offset in buffer
        );

        gl.vertexAttribPointer(
            variableLoc + 2,  // location
            3,                // size (num values to pull from buffer per iteration)
            gl.FLOAT,         // type of data in buffer
            false,            // normalize
            bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
            4 * 6,           // offset in buffer
        );


        if (angleExtension != null) {
            angleExtension.vertexAttribDivisorANGLE(variableLoc + 0, vertexAttribDivisor);
            angleExtension.vertexAttribDivisorANGLE(variableLoc + 1, vertexAttribDivisor);
            angleExtension.vertexAttribDivisorANGLE(variableLoc + 2, vertexAttribDivisor);
        }


    }

}
