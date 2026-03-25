import { GpuBufferView } from './gpu-buffer-view';
import { GpuBaseBuffer } from './gpu-base-buffer';
import type { GpuBuffer } from './gpu-buffer';

export class GpuByteBuffer extends GpuBaseBuffer<Uint8Array> implements GpuBuffer {

    constructor(values: number[], componentsPerInstance?: number)
    constructor(size: number, componentsPerInstance?: number)
    constructor(sizeOrValue: number | number[], componentsPerInstance = 1) {
        if (Array.isArray(sizeOrValue)) {
            // using values
            super(Uint8Array, sizeOrValue.length, 'byte', componentsPerInstance);
            this.pushRange(sizeOrValue);
        }
        else {
            // using size
            super(Uint8Array, sizeOrValue, 'byte', componentsPerInstance);
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
            gl.UNSIGNED_BYTE,
            Uint8Array.BYTES_PER_ELEMENT
        );
    }
}
