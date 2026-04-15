import { GpuBufferView } from './gpu-buffer-view';

export interface AttributeBuffer {
    /** returns the version of the data in the buffer. This increments whenever the data changes */
    dataVersion: number;
    /** returns all valid values that should be uploaded to GPU */
    data: ArrayBufferView;
    /** returns the length of the buffer */
    length: number;
    /** returns the number of items in the buffer */
    count: number;

    /** set the vertex attribute pointer for this buffer */
    setVertexAttribPointer(
        gl: WebGLRenderingContext,
        loc: GLint,
        angle: ANGLE_instanced_arrays | null,
        view: GpuBufferView
      ): void;
}
