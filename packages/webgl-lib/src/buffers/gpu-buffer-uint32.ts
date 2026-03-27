import { GpuBufferView } from './gpu-buffer-view';
import { GpuBaseBuffer } from './gpu-base-buffer';
import type { GpuBuffer } from './gpu-buffer';

export class GpuUInt32Buffer extends GpuBaseBuffer<Uint32Array> implements GpuBuffer {
    constructor(values: number[], componentsPerInstance?: number)
    constructor(size: number, componentsPerInstance?: number)
    constructor(sizeOrValue: number | number[], componentsPerInstance = 1) {
        if (Array.isArray(sizeOrValue)) {
            // using values
            super(Uint32Array, sizeOrValue.length, 'uint32', componentsPerInstance);
            this.pushRange(sizeOrValue);
        }
        else {
            // using size
            super(Uint32Array, sizeOrValue, 'uint32', componentsPerInstance);
        }
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
            gl.UNSIGNED_INT,
            Uint32Array.BYTES_PER_ELEMENT
        );
    }

}
