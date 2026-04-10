import { GpuReadableBuffer } from './gpu-readable-buffer';

/** Datatypes supported by GPU buffers */
export type TypedArray =
  | Float32Array
  | Float64Array
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array;

/** A gpu buffer that can be written to */
export interface GpuWritableBuffer extends GpuReadableBuffer {
  /** add items to the end of the buffer */
  push(...args: number[]): void;
  /** add items to the end of the buffer */
  pushRange(values: number[] | TypedArray): void;
  /** ensure buffer can hold at least the given number of values */
  ensureCapacity(size: number): this;
  /** increase capacity so a number of additional values can be appended */
  increaseCapacity(newItems: number): this;
  /** fill the buffer with generated values */
  generate(calc: (i: number) => number): this;
  /** remove all items from the buffer */
  clear(): void;
}
