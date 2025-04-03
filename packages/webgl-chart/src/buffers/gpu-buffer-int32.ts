import { GpuBufferView } from "./buffer-view";
import { GpuBaseBuffer } from "./gpu-base-buffer";
import type { GpuBuffer } from "./gpu-buffer";

export class GpuInt32Buffer extends GpuBaseBuffer<Uint32Array> implements GpuBuffer {

    constructor(size: number, componentsPerInstance = 1) {
        super(Uint32Array, size, 'uint32', componentsPerInstance);
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
