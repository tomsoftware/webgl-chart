import { GpuBufferView } from './gpu-buffer-view';
import { GpuBaseBuffer } from './gpu-base-buffer';
import { GpuRotatedBuffer } from './gpu-rotated-buffer';
import { IGpuBuffer } from './i-gpu-buffer';


type TypedArrayConstructor<T extends TypedArray> = {
  new (size: number): T;
};

export type Float32Buffer = { kind: 'float32' };
export type UInt32Buffer  = { kind: 'uint32' };
export type UInt16Buffer  = { kind: 'uint16' };
export type UInt8Buffer  = { kind: 'uint16' };
export type Matrix3x3Buffer = { kind: 'mat3x3' };

interface GpuTypeInfo {
  arrayType: TypedArrayConstructor<any>;
  glType: number;
  bytes: number;
  setAttribPointer?: (
    gl: WebGLRenderingContext,
    loc: GLint,
    angle: ANGLE_instanced_arrays | null,
    view: GpuBufferView
  ) => void;
}


export const GPU_TYPE_INFO = {
  float32: {
    arrayType: Float32Array,
    glType: WebGLRenderingContext.FLOAT,
    bytes: Float32Array.BYTES_PER_ELEMENT,
  } satisfies GpuTypeInfo,

  uint32: {
    arrayType: Uint32Array,
    glType: WebGLRenderingContext.UNSIGNED_INT,
    bytes: Uint32Array.BYTES_PER_ELEMENT,
  } satisfies GpuTypeInfo,

  uint16: {
    arrayType: Uint16Array,
    glType: WebGLRenderingContext.UNSIGNED_SHORT,
    bytes: Uint16Array.BYTES_PER_ELEMENT,
  } satisfies GpuTypeInfo,

  uint8: {
    arrayType: Uint8Array,
    glType: WebGLRenderingContext.UNSIGNED_BYTE,
    bytes: Uint8Array.BYTES_PER_ELEMENT,
  } satisfies GpuTypeInfo,

  mat3x3: {
    arrayType: Float32Array,
    glType: WebGLRenderingContext.FLOAT,
    bytes: Float32Array.BYTES_PER_ELEMENT * 9,

    setAttribPointer(gl, loc, angle, view) {
      const bytesPerMatrix = 4 * 3 * 3;
      const offset = view.offset * bytesPerMatrix;

      for (let i = 0; i < 3; i++) {
        gl.enableVertexAttribArray(loc + i);

        gl.vertexAttribPointer(
          loc + i,
          3,
          gl.FLOAT,
          false,
          bytesPerMatrix,
          offset + i * 4 * 3
        );

        if (angle) {
          angle.vertexAttribDivisorANGLE(loc + i, view.vertexAttribDivisor);
        }
      }
    }
  } satisfies GpuTypeInfo
} as const;


type GpuTypeKey = keyof typeof GPU_TYPE_INFO;


/**
 * Interface for GPU buffer implementations
 */
interface IGpuBufferImpl<T extends TypedArray> extends IGpuBuffer{
  data: T | TypedArray;
}

/**
 * Universal GPU Buffer that can use different implementations
 */
export class GpuBuffer<T extends GpuTypeKey> {
  private impl: IGpuBufferImpl<any>;
  private info = GPU_TYPE_INFO[this.type];

  constructor(
    private type: T,
    size: number,
    componentsPerInstance: number = 1,
    rotatedBuffer: boolean = false
  ) {
    const arrayType = this.info.arrayType;

    if (rotatedBuffer) {
      this.impl = new GpuRotatedBufferWrapper(
        arrayType as any,
        size,
        this.type as string,
        componentsPerInstance,
        this.info
      );
    } else {
      this.impl = new GpuBaseBufferWrapper(
        arrayType as any,
        size,
        this.type as string,
        componentsPerInstance,
        this.info
      );
    }
  }

  setVertexAttribPointer(
    gl: WebGLRenderingContext,
    loc: GLint,
    angle: ANGLE_instanced_arrays | null,
    view: GpuBufferView
  ) {
    this.impl.setVertexAttribPointer(gl, loc, angle, view);
  }

  get data() {
    return this.impl.data;
  }

  get dataVersion() {
    return this.impl.dataVersion;
  }

  get length() {
    return this.impl.length;
  }

  get count() {
    return this.impl.count;
  }

  get first() {
    return this.impl.first;
  }

  get last() {
    return this.impl.last;
  }

  binarySearch(value: number) {
    return this.impl.binarySearch(value);
  }

  push(...args: number[]) {
    this.impl.pushRange(args);
  }

  pushRange(values: number[] | TypedArray) {
    this.impl.pushRange(values);
  }

  clear() {
    this.impl.clear();
  }

  get(index: number) {
    return this.impl.get(index);
  }

  ensureCapacity(size?: number) {
    if (this.impl instanceof GpuBaseBufferWrapper) {
      return this.impl.ensureCapacity(size);
    }
    return this;
  }

  increaseCapacity(newItems?: number) {
    if (this.impl instanceof GpuBaseBufferWrapper) {
      return this.impl.increaseCapacity(newItems);
    }
    return this;
  }

  /**
   * Generate buffer with values from a calculation function
   * @param calc Function that takes an index and returns a value
   * @returns This buffer for chaining
   */
  generate(calc: (i: number) => number): this {
    if (this.impl instanceof GpuBaseBufferWrapper) {
      this.impl.generate(calc);
    } else if (this.impl instanceof GpuRotatedBufferWrapper) {
      // For rotated buffers, generate fills it from start
      for (let i = 0; i < this.impl.count; i++) {
        this.impl.push(calc(i));
      }
      this.impl.updateDataVersion();
    }
    return this;
  }

  /**
   * Create a buffer with values generated from another buffer
   * @param src Source buffer
   * @param calc Function to transform each value
   */

  static generateFrom<T extends GpuTypeKey, K extends GpuTypeKey>(
    type: T,
    src: GpuBuffer<K>,
    calc: (srcValue: number) => number
  ): GpuBuffer<T> {
    const srcData = src.data as TypedArray;
    const srcBuffer = new GpuBuffer(
      type,
      srcData.length,
      (src['impl'] as GpuBaseBufferWrapper<any>)?.componentsPerInstance || 1,
      false
    );

    for (let i = 0; i < srcData.length; i++) {
      srcBuffer.push(calc(srcData[i]));
    }

    return srcBuffer;
  }
}

/**
 * Wrapper for GpuBaseBuffer to implement IGpuBufferImpl
 */
class GpuBaseBufferWrapper<T extends TypedArray> extends GpuBaseBuffer<T> implements IGpuBufferImpl<T> {
  constructor(
    activator: { new(size: number): T },
    size: number,
    typeName: string,
    componentsPerInstance: number,
    private typeInfo: GpuTypeInfo
  ) {
    super(activator, size, typeName, componentsPerInstance);
  }

  setVertexAttribPointer(
    gl: WebGLRenderingContext,
    variableLoc: GLint,
    angleExtension: ANGLE_instanced_arrays | null,
    bufferView: GpuBufferView
  ) {
    if (this.typeInfo.setAttribPointer) {
      this.typeInfo.setAttribPointer(gl, variableLoc, angleExtension, bufferView);
    } else {
      this.setBasicVertexAttribPointer(
        gl,
        variableLoc,
        angleExtension,
        bufferView,
        this.typeInfo.glType,
        this.typeInfo.bytes
      );
    }
  }
}

/**
 * Wrapper for GpuRotatedBuffer to implement IGpuBufferImpl
 */
class GpuRotatedBufferWrapper<T extends TypedArray> extends GpuRotatedBuffer<T> implements IGpuBufferImpl<T> {
  constructor(
    activator: { new(size: number): T },
    size: number,
    typeName: string,
    componentsPerInstance: number,
    private typeInfo: GpuTypeInfo
  ) {
    super(activator, size, typeName, componentsPerInstance);
  }

  get first(): number | null {
    if (this.buffer.length <= 0) {
      return null;
    }
    return this.buffer[0];
  }

  get last(): number | null {
    if (this.buffer.length <= 0) {
      return null;
    }
    return this.buffer[this.buffer.length - 1];
  }

  setVertexAttribPointer(
    gl: WebGLRenderingContext,
    variableLoc: GLint,
    angleExtension: ANGLE_instanced_arrays | null,
    bufferView: GpuBufferView
  ) {
    if (this.typeInfo.setAttribPointer) {
      this.typeInfo.setAttribPointer(gl, variableLoc, angleExtension, bufferView);
    } else {
      this.setBasicVertexAttribPointer(
        gl,
        variableLoc,
        angleExtension,
        bufferView,
        this.typeInfo.glType,
        this.typeInfo.bytes
      );
    }
  }
}

