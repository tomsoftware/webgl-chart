import { GpuBufferView } from './gpu-buffer-view';
import { GpuBaseBuffer } from './gpu-base-buffer';
import type { GpuBuffer } from './gpu-buffer';

export class GpuByteBuffer extends GpuBaseBuffer<Uint8Array> implements GpuBuffer {

    constructor(size: number, componentsPerInstance = 1) {
        super(Uint8Array, size, 'byte', componentsPerInstance);
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
