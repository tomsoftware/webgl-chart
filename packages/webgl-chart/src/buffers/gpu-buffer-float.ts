import { GpuBufferView } from "./buffer-view";
import { ArrayUtilities } from "./array-utilities";
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

    /** Return the closes index a given value matches in the buffer-values */
    public findIndex(value: number): number | null {
        var range = ArrayUtilities.guessIndexRange(this.buffer, this.bufferOffset, this.bufferEnd - 1, value);
        if (range == null) {
            // value is outside of the arrays values
            if (value < this.buffer[this.bufferOffset]) {
                // value is before the first element
                return this.bufferOffset;
            }
            // value is after last element
            return this.bufferEnd - 1;
        }

        // value is inside the array -> get best index
        const pos = ArrayUtilities.binarySearch(this.buffer, range[0], range[1], value);
        const low = pos[0];
        const high = pos[1];

        // check what is closer low or high to given value
        if (Math.abs(value - this.buffer[low]) < Math.abs(value - this.buffer[high])) {
            return low;
        }
        return high;

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
