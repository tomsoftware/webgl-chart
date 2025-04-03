import { GpuBufferView } from "./buffer-view";
import { GpuBaseBuffer } from "./gpu-base-buffer";
import type { GpuBuffer } from "./gpu-buffer";

export class GpuShortBuffer extends GpuBaseBuffer<Uint16Array> implements GpuBuffer {

    constructor(size: number, componentsPerInstance = 1) {
        super(Uint16Array, size, 'short', componentsPerInstance);
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
