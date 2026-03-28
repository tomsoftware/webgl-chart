import { GpuBufferView } from './gpu-buffer-view';

export interface IGpuBuffer {
  dataVersion: number;
  length: number;
  count: number;
  first: number | null;
  last: number | null;
  /**
   * returns the index of a given value
   * Array needs to be sorted
   */
  binarySearch(value: number): number | null;
  get(index: number): number[];
  push(...args: number[]): void;
  pushRange(values: number[] | TypedArray): void;
  /** remove all items from the buffer */
  clear(): void;
  setVertexAttribPointer(
    gl: WebGLRenderingContext,
    loc: GLint,
    angle: ANGLE_instanced_arrays | null,
    view: GpuBufferView
  ): void;
}
