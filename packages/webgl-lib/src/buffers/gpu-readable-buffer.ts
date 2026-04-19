import { AttributeBuffer } from './attribute-buffer';

/** A gpu buffer that can be read from */
export interface GpuReadableBuffer extends AttributeBuffer {
  /** returns a view of all valid data in the buffer */
  readonly data: ArrayBufferView;
  /** returns the index of a given value. -1 if not found */
  findIndex(value: number): number;
  /** returns all components of on attribute at given position (based on componentsPerAttribute) or empty */
  getAttributeAt(index: number): number[];
  /**Returns a single component value of an attribute at the given logical index. */
  getComponentAt(attributeIndex: number, componentIndex?: number): number;
  /** returns the components of the first attribute or empty */
  readonly firstAttribute: number[];
  /** returns the components of the last attribute or empty */
  readonly lastAttribute: number[];
}
