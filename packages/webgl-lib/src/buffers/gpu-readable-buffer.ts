import { AttributeBuffer } from './attribute-buffer';

/** A gpu buffer that can be read from */
export interface GpuReadableBuffer extends AttributeBuffer {
  /** returns a view of all valid data in the buffer */
  readonly data: ArrayBufferView;
  /** returns the index of a given value. -1 if not found */
  findIndex(value: number): number;
  /** returns one logical item (based on componentsPerAttribute) */
  get(index: number): number[];
  /** returns the values of the first component of the item */
  readonly first: number[];
  /** returns the values of the last component of the item */
  readonly last: number[];
}
