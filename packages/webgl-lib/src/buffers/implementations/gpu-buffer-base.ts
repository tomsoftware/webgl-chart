import { ArrayUtilities } from '../array-utilities';
import { GpuBufferView } from '../gpu-buffer-view';
import { GpuWritableBuffer, TypedArray } from '../gpu-writable-buffer';
import { TypedArrayConstructor } from './gpu-buffer-types';

/**
 * Shared typed-buffer implementation for growing and ring buffers.
 */
export abstract class GpuBufferBase<T extends TypedArray> implements GpuWritableBuffer {
  public buffer: T;
  protected validLength = 0;
  protected readonly activator: TypedArrayConstructor<T>;
  protected readonly typeName: string;

  // General naming:
  //   Attribute: one attribute variable in the shader
  //   Component: one numeric value inside the attribute

  /** number of components per attribute slot (e.g. 3 for vec3, 3 for each column of mat3) */
  public readonly attributeSize: number;

  /** number of attribute slots used by this GLSL attribute (e.g. 1 for vec3, 3 for mat3) */
  public readonly componentsPerAttribute: number;

  /** total number of components (attributeSize * componentsPerAttribute) */
  public readonly totalComponents: number;

  /** number of bytes per component element (e.g. 4 for float32) */
  public readonly bytesPerComponent: number;

  public readonly glType: number;

  protected currentDataVersion = -1;

  public constructor(
    activator: TypedArrayConstructor<T>,
    sizeOrValues: number | number[],
    typeName: string,
    attributeSize: number,
    componentsPerAttribute: number,
    glType: number,
    bytesPerComponent: number
  ) {
    const size = typeof sizeOrValues === 'number' ? sizeOrValues : (sizeOrValues as number[]).length;

    const safeSize = Math.max(0, size ?? 0);
    const safeComponentsPerAttribute = Math.max(1, componentsPerAttribute ?? 1);
    const safeBytesPerComponent = Math.max(1, bytesPerComponent ?? 1)
    const totalComponents = attributeSize * safeComponentsPerAttribute;

    this.buffer = new activator(safeSize * totalComponents);
    this.activator = activator;
    this.typeName = typeName;
    this.attributeSize = attributeSize;
    this.componentsPerAttribute = safeComponentsPerAttribute;
    this.glType = glType;
    this.bytesPerComponent = safeBytesPerComponent;
    this.totalComponents = totalComponents;

    if (Array.isArray(sizeOrValues)) {
      this.pushRange(sizeOrValues);
    }
  }

  public get data(): T {
    return this.buffer.subarray(0, this.validLength) as T;
  }

  public get dataVersion(): number {
    return this.currentDataVersion;
  }

  public get capacity(): number {
    return this.buffer.length;
  }

  public get length(): number {
    return this.validLength;
  }

  public get count(): number {
    return Math.floor(this.validLength / this.totalComponents);
  }
  
  public get firstAttribute(): number[] {
    return this.getAttributeAt(0);
  }

  public get lastAttribute(): number[] {
    return this.getAttributeAt(this.count - 1);
  }

  public findIndex(value: number): number {
    const maxIndex = this.count - 1;
    if (maxIndex < 0) {
      return -1;
    }

    const minIndex = 0;
    const range = ArrayUtilities.guessIndexRange(
      (index) => this.getAttributeAt(index)[0],
      minIndex,
      maxIndex,
      value,
    );

    if (range == null) {
      if (value < this.getAttributeAt(minIndex)[0]) {
        return minIndex;
      }
      return maxIndex;
    }

    const pos = ArrayUtilities.binarySearch(
      (index) => this.getAttributeAt(index)[0],
      range[0],
      range[1],
      value,
    );

    const low = Math.max(minIndex, Math.min(maxIndex, pos[0]));
    const high = Math.max(minIndex, Math.min(maxIndex, pos[1]));

    const lowDelta = Math.abs(value - this.getAttributeAt(low)[0]);
    const highDelta = Math.abs(value - this.getAttributeAt(high)[0]);
    return lowDelta <= highDelta ? low : high;
  }

  public generate(calc: (i: number) => number): this {
    for (let i = 0; i < this.capacity; i++) {
      this.buffer[i] = calc(i);
    }
    this.validLength = this.capacity;
    this.currentDataVersion++;
    return this;
  }

  public ensureCapacity(size: number): this {
    this.doEnsureCapacity(size);
    return this;
  }

  public increaseCapacity(newItems: number): this {
    const safeNewItems = Math.max(0, newItems ?? 0);
    this.doEnsureCapacity(this.validLength + safeNewItems);
    return this;
  }

  public push(...args: number[]): void {
    this.pushRange(args);
  }

  public pushRange(values: TypedArray | number[]): void {
    if (values.length <= 0) {
      return;
    }

    this.doPushRange(values);
    this.currentDataVersion++;
  }

  public clear(): this {
    this.validLength = 0;
    this.currentDataVersion++;
    return this;
  }

  /**
   * Returns a single component value of an attribute at the given logical index.
   */
  public getComponentAt(attributeIndex: number, componentIndex: number = 0): number {
      const physical = this.resolvePhysicalIndex(attributeIndex);
      const offset = physical + componentIndex;
      return this.buffer[offset];
  }

  /**
   * Returns the full attribute at the given logical index.
  */
  public getAttributeAt(attributeIndex: number): number[] {
      const start = this.resolvePhysicalIndex(attributeIndex);
      const end = start + this.componentsPerAttribute;

      return Array.from(this.buffer.subarray(start, end));
  }

  /**
   * Writes all components of an attribute at the given logical index.
   */
  public setAttributeAt(attributeIndex: number, values: number[]): void {
      const start = this.resolvePhysicalIndex(attributeIndex);
      for (let i = 0; i < this.componentsPerAttribute; i++) {
          this.buffer[start + i] = values[i];
      }
      this.currentDataVersion++;
  }

  /**
   * Writes a single component of an attribute at the given logical index.
   */
  public setComponentAt(attributeIndex: number, componentIndex: number, value: number): void {
      const start = this.resolvePhysicalIndex(attributeIndex);
      this.buffer[start + componentIndex] = value;
      this.currentDataVersion++;
  }


  public setVertexAttribPointer(
    gl: WebGLRenderingContext,
    variableLoc: number,
    angleExtension: ANGLE_instanced_arrays | null,
    bufferView: GpuBufferView
  ): void {

    const bytesPerComponent = this.bytesPerComponent;

    const stride = this.componentsPerAttribute * this.attributeSize * bytesPerComponent;
    const offset = bufferView.offset * stride;

    for (let i = 0; i < this.componentsPerAttribute; i++) {
      const loc = variableLoc + i;

      gl.enableVertexAttribArray(loc);

      gl.vertexAttribPointer(
        loc,
        this.attributeSize,
        this.glType,
        false,
        stride,
        offset + i * this.attributeSize * bytesPerComponent
      );

      angleExtension?.vertexAttribDivisorANGLE(loc, bufferView.vertexAttribDivisor);
    }
  }

  protected abstract doEnsureCapacity(size: number): void;
  protected abstract doPushRange(values: TypedArray | number[]): void;

  /** Converts a logical attribute index into the physical buffer index */
  protected abstract resolvePhysicalIndex(logicalIndex: number): number;
}
