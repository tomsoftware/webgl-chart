import { GpuBufferView } from './gpu-buffer-view';
import { GpuBaseBuffer } from './gpu-base-buffer';
import type { GpuBuffer } from './gpu-buffer';

export class GpuUint16Buffer extends GpuBaseBuffer<Uint16Array> implements GpuBuffer {

    constructor(values: number[], componentsPerInstance?: number)
    constructor(size: number, componentsPerInstance?: number)
    constructor(sizeOrValue: number | number[], componentsPerInstance = 1) {
        if (Array.isArray(sizeOrValue)) {
            // using values
            super(Uint16Array, sizeOrValue.length, 'short', componentsPerInstance);
            this.pushRange(sizeOrValue);
        }
        else {
            // using size
            super(Uint16Array, sizeOrValue, 'short', componentsPerInstance);
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
            gl.UNSIGNED_SHORT,
            Uint16Array.BYTES_PER_ELEMENT
        );
    }

}
