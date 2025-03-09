import { GpuBaseBuffer } from "./gpu-base-buffer";
import type { GpuBuffer } from "./gpu-buffer";

export class GpuFloatBuffer extends GpuBaseBuffer<Float32Array> implements GpuBuffer {

    /** return a view of the buffer with the current data */
    public get data() {
        return this.buffer.subarray(this.bufferOffset, this.bufferEnd);
    }

    constructor(size: number, componentsPerInstance = 1) {
        super(Float32Array, size, 'float', componentsPerInstance);
    }

    public static generateFrom(src: GpuFloatBuffer, calc: (srcValue: number) => number): GpuFloatBuffer {
        const srcData = src.data;
        const newBuffer = new GpuFloatBuffer(srcData.length);
        newBuffer.bufferOffset = 0;
        newBuffer.bufferEnd = srcData.length;
        const newData = newBuffer.buffer;
        
        for (let i = 0; i < newData.length; i++) {
            newData[i] = calc(srcData[i]);
        }
    
        return newBuffer;
    }

    public generate(calc: (index: number) => number): GpuFloatBuffer {
        this.bufferOffset = 0;
        this.bufferEnd = this.buffer.length;

        const data = this.data;
        for (let i = 0; i < data.length; i++) {
            data[i] = calc(i);
        }

        this.updateDataVersion();

        return this;
    }

    public setVertexAttribPointer(
        gl: WebGLRenderingContext,
        variableLoc: GLint,
        angleExtension: ANGLE_instanced_arrays | null,
        vertexAttribDivisor: number
    ): void {

        super.setBasicVertexAttribPointer(
            gl,
            variableLoc,
            angleExtension,
            vertexAttribDivisor,
            gl.FLOAT
        );
    }


}
