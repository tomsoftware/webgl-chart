import { GpuBaseBuffer } from "./gpu-base-buffer";
import type { GpuBuffer } from "./gpu-buffer";

export class GpuFloatBuffer extends GpuBaseBuffer<Float32Array> implements GpuBuffer {

    /** return a view of the buffer with the current data */
    public get data() {
        return this.buffer.subarray(this.bufferOffset, this.bufferEnd);
    }

    constructor(size: number, componentsPerIteration = 1) {
        super(Float32Array, size, componentsPerIteration);
    }

    public static generateFrom(src: GpuFloatBuffer, calc: (srcValue: number) => number): GpuFloatBuffer {
        const srcData = src.data;
        const newBuffer = new GpuFloatBuffer(srcData.length);
        const newData = newBuffer.data;
        
        for (let i = 0; i < newData.length; i++) {
            newData[i] = calc(srcData[i]);
        }
    
        return newBuffer;
    }

    public generate(calc: (index: number) => number): GpuFloatBuffer {
        const data = this.data;
        for (let i = 0; i < this.data.length; i++) {
            data[i] = calc(i);
        }

        this.updateDataVersion();

        return this;
    }

    public setVertexAttribPointer(gl: WebGLRenderingContext, variableLoc: GLint) {

        // Tell the attribute how to get data out of idBuffer (ARRAY_BUFFER)
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            variableLoc,
            this.componentsPerIteration,
            gl.FLOAT,
            normalize,
            stride,
            offset
        );
    }

}
