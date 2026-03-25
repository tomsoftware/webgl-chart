import { GpuBufferView } from './gpu-buffer-view';
import { GpuBaseBuffer } from './gpu-base-buffer';
import type { GpuBuffer } from './gpu-buffer';

export class GpuFloatBuffer extends GpuBaseBuffer<Float32Array> implements GpuBuffer {

    /** return a view of the buffer with the current data */
    public get data() {
        return this.buffer.subarray(this.bufferOffset, this.bufferEnd);
    }

    constructor(values: number[], componentsPerInstance?: number)
    constructor(size: number, componentsPerInstance?: number)
    constructor(sizeOrValue: number | number[], componentsPerInstance = 1) {
        if (Array.isArray(sizeOrValue)) {
            // using values
            super(Float32Array, sizeOrValue.length, 'float', componentsPerInstance);
            this.pushRange(sizeOrValue);
        }
        else {
            // using size
            super(Float32Array, sizeOrValue, 'float', componentsPerInstance);
        }
    }

    /** generate data from a given buffer: result[i] = calc(src[i]) */
    public static generateFrom(src: GpuFloatBuffer, calc: (srcValue: number) => number): GpuFloatBuffer {
        return GpuBaseBuffer.generateFromBase(GpuFloatBuffer, src, calc);
    }

    /** generate buffer with the given number of elements: = calc(i) */
    public static generate(length: number, calc: (index: number) => number) {
        return GpuBaseBuffer.generateBase(GpuFloatBuffer, length, calc);
    }

    public setVertexAttribPointer(
        gl: WebGLRenderingContext,
        variableLoc: GLint,
        angleExtension: ANGLE_instanced_arrays | null,
        bufferView: GpuBufferView
    ): void {

        super.setBasicVertexAttribPointer(
            gl,
            variableLoc,
            angleExtension,
            bufferView,
            gl.FLOAT,
            Float32Array.BYTES_PER_ELEMENT
        );
    }


}
