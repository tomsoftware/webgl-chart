import { GpuBufferView } from "../gpu-buffer-view";
import { TypedArray } from "../i-gpu-buffer";

/**
 * Interface for GPU buffer implementations
 */
export interface IGpuBufferImpl<T extends TypedArray> {
  last: number;
  first: number;
  count: number;
  length: number;
  generate(calc: (i: number) => number): void;
  capacity: number;
  increaseCapacity(newItems: number): void;
  ensureCapacity(size: number): void;
  get(index: number): number[];
  pushRange(values: TypedArray | number[]): void;
  clear(): void;
  data: T;
  setVertexAttribPointer(gl: WebGLRenderingContext,
              variableLoc: number,
              angleExtension: ANGLE_instanced_arrays | null,
              bufferView: GpuBufferView,
              type: GLenum,
              bytesPerInstance: number,
    ): void;
}
