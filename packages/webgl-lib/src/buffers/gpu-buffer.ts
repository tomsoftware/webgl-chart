import { GpuBufferView } from './gpu-buffer-view';
import { GpuGrowingBuffer } from './implementations/gpu-growing-buffer';
import { GpuRingBuffer } from './implementations/gpu-ring-buffer';
import { TypedArray } from './i-gpu-buffer';
import { IGpuBufferImpl } from './implementations/gpu-buffer-base';


type TypedArrayConstructor<T extends TypedArray> = {
  new (size: number): T;
};

export type Float32Buffer = { kind: 'float32' };
export type UInt32Buffer  = { kind: 'uint32' };
export type UInt16Buffer  = { kind: 'uint16' };
export type UInt8Buffer  = { kind: 'uint16' };
export type Matrix3x3Buffer = { kind: 'mat3x3' };

interface GpuBufferTypeInfo {
  arrayType: TypedArrayConstructor<any>;
  setAttribPointer: (
    impl: IGpuBufferImpl<any>,
    gl: WebGLRenderingContext,
    variableLoc: GLint,
    angle: ANGLE_instanced_arrays | null,
    view: GpuBufferView
  ) => void;
}

export const GPU_TYPE_INFO = {
  float32: {
    arrayType: Float32Array,
    setAttribPointer(impl: IGpuBufferImpl<any>, gl: WebGLRenderingContext,
        variableLoc: GLint, angleExtension: ANGLE_instanced_arrays | null,
        bufferView: GpuBufferView,
    ) { 
        impl.setVertexAttribPointer(
        gl,
        variableLoc,
        angleExtension,
        bufferView,
        WebGLRenderingContext.FLOAT,
        Float32Array.BYTES_PER_ELEMENT
      );
     }
  } satisfies GpuBufferTypeInfo,

  uint32: {
    arrayType: Uint32Array,
    setAttribPointer(impl: IGpuBufferImpl<any>, gl: WebGLRenderingContext,
        variableLoc: GLint, angleExtension: ANGLE_instanced_arrays | null,
        bufferView: GpuBufferView,
    ) { 
        impl.setVertexAttribPointer(
        gl,
        variableLoc,
        angleExtension,
        bufferView,
        WebGLRenderingContext.UNSIGNED_INT,
        Float32Array.BYTES_PER_ELEMENT
      );
     }

  } satisfies GpuBufferTypeInfo,

  uint16: {
    arrayType: Uint16Array,
    setAttribPointer(impl: IGpuBufferImpl<any>, gl: WebGLRenderingContext,
        variableLoc: GLint, angleExtension: ANGLE_instanced_arrays | null,
        bufferView: GpuBufferView,
    ) { 
        impl.setVertexAttribPointer(
        gl,
        variableLoc,
        angleExtension,
        bufferView,
        WebGLRenderingContext.UNSIGNED_SHORT,
        Float32Array.BYTES_PER_ELEMENT
      );
     }
  } satisfies GpuBufferTypeInfo,

  uint8: {
    arrayType: Uint8Array,
    setAttribPointer(impl: IGpuBufferImpl<any>, gl: WebGLRenderingContext,
        variableLoc: GLint, angleExtension: ANGLE_instanced_arrays | null,
        bufferView: GpuBufferView,
    ) { 
        impl.setVertexAttribPointer(
        gl,
        variableLoc,
        angleExtension,
        bufferView,
        WebGLRenderingContext.UNSIGNED_BYTE,
        Float32Array.BYTES_PER_ELEMENT
      );
     }
  } satisfies GpuBufferTypeInfo,

  mat3x3: {
    arrayType: Float32Array,
     setAttribPointer(impl: IGpuBufferImpl<any>, gl: WebGLRenderingContext,
        variableLoc: GLint, angleExtension: ANGLE_instanced_arrays | null,
        bufferView: GpuBufferView,
    ) {
        gl.enableVertexAttribArray(variableLoc + 0);
        gl.enableVertexAttribArray(variableLoc + 1);
        gl.enableVertexAttribArray(variableLoc + 2);

        const bytesPerMatrix = 4 * 3 * 3;
        const offset = bufferView.offset * bytesPerMatrix;

        gl.vertexAttribPointer(
            variableLoc + 0,  // location
            3,                // size (num values to pull from buffer per iteration)
            gl.FLOAT,         // type of data in buffer
            false,            // normalize
            bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
            offset,           // offset in buffer
        );

        gl.vertexAttribPointer(
            variableLoc + 1,  // location
            3,                // size (num values to pull from buffer per iteration)
            gl.FLOAT,         // type of data in buffer
            false,            // normalize
            bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
            offset + 4 * 3,   // offset in buffer
        );

        gl.vertexAttribPointer(
            variableLoc + 2,  // location
            3,                // size (num values to pull from buffer per iteration)
            gl.FLOAT,         // type of data in buffer
            false,            // normalize
            bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
            offset + 4 * 6,   // offset in buffer
        );


        if (angleExtension != null) {
            angleExtension.vertexAttribDivisorANGLE(variableLoc + 0, bufferView.vertexAttribDivisor);
            angleExtension.vertexAttribDivisorANGLE(variableLoc + 1, bufferView.vertexAttribDivisor);
            angleExtension.vertexAttribDivisorANGLE(variableLoc + 2, bufferView.vertexAttribDivisor);
        }
    }
  } satisfies GpuBufferTypeInfo
} as const;


type GpuTypeKey = keyof typeof GPU_TYPE_INFO;


type ArrayTypeOf<T extends GpuTypeKey> =
  InstanceType<(typeof GPU_TYPE_INFO)[T]["arrayType"]>;


/**
 * Universal GPU Buffer that can use different implementations
 */
export class GpuBuffer<T extends GpuTypeKey> {
  private impl: IGpuBufferImpl<ArrayTypeOf<T>>;
  private info = GPU_TYPE_INFO[this.type];
  protected currentDataVersion = -1;

  constructor(
    private type: T,
    size: number,
    componentsPerInstance: number = 1,
    rotatedBuffer: boolean = false
  ) {
    const arrayType = this.info.arrayType;

    if (rotatedBuffer) {
      this.impl = new GpuRingBuffer(
        arrayType as any,
        size,
        this.type as string,
        componentsPerInstance,
      );
    } else {
      this.impl = new GpuGrowingBuffer(
        arrayType as any,
        size,
        this.type as string,
        componentsPerInstance,
      );
    }
  }

  setVertexAttribPointer(
    gl: WebGLRenderingContext,
    variableLoc: GLint,
    angleExtension: ANGLE_instanced_arrays | null,
    bufferView: GpuBufferView
  ) {
    this.info.setAttribPointer(this.impl, gl, variableLoc, angleExtension, bufferView);
  }


  public get data(): ArrayTypeOf<T> {
    return this.impl.data;
  }

  /** Returns a number that changes when the data changes */
  public get dataVersion() {
    return this.currentDataVersion;
  }

  protected updateDataVersion() {
      this.currentDataVersion++;
  }

  public get length() {
    return this.impl.length;
  }

  public get count() {
    return this.impl.count;
  }

  public get first() {
    return this.impl.first;
  }

  public get last() {
    return this.impl.last;
  }

  public binarySearch(value: number) {
    return this.impl.binarySearch(value);
  }

  /** Adds one or more individual values to the buffer. */
  push(...args: number[]): void {
    this.impl.pushRange(args);
  }

  pushRange(values: number[] | TypedArray): void {
    this.impl.pushRange(values);
    this.updateDataVersion();
  }

   /** Resets the buffer, clearing all data while preserving allocated capacity.  */
  clear(): this {
    this.impl.clear();
    this.updateDataVersion();
    return this;
  }

  get(index: number): number[] {
    return this.impl.get(index);
  }

  /** Makes sure the current buffer can handle the given number of items */
  public ensureCapacity(size: number): this {
    size = Math.max(0, size ?? 0);

    this.impl.ensureCapacity(size);

    return this;
  }

  /** Makes sure the given number of new items fits into the internal buffer */
  public increaseCapacity(newItems: number): this {
    newItems = Math.max(0, newItems ?? 0);

    this.impl.increaseCapacity(newItems);

    return this;
  }

  /** Replace all buffers-values with a callback  */
  generate(calc: (i: number) => number): this {
    this.impl.generate(calc);
    this.updateDataVersion();
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
    calc: (srcValue: number) => number,
    componentsPerInstance: number = 1
  ): GpuBuffer<T> {
    const srcData = src.data as TypedArray;
    const srcBuffer = new GpuBuffer(
      type,
      srcData.length,
      componentsPerInstance,
      (src.impl as GpuRingBuffer<T.type>) == null
    );

    for (let i = 0; i < srcData.length; i++) {
      srcBuffer.push(calc(srcData[i]));
    }

    return srcBuffer;
  }
}


