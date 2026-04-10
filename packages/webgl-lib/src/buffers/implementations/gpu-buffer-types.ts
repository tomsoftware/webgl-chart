import { GpuBufferView } from "../gpu-buffer-view";
import { TypedArray } from "../gpu-writable-buffer";

export type TypedArrayConstructor<T extends TypedArray> = {
  new (size: number): T;
};

export type SetAttribPointer = (gl: WebGLRenderingContext, variableLoc: GLint,
        angleExtension: ANGLE_instanced_arrays | null, bufferView: GpuBufferView,
      componentsPerInstance: number) => void;

export type GpuBufferDataType = 'float32' | 'uint32' | 'uint16' | 'uint8' | 'mat3x3';

export type GpuBufferTypeInfo<T extends TypedArray> = {
  arrayType: TypedArrayConstructor<T>;
  setAttribPointer: SetAttribPointer;
};

const isBrowser = typeof WebGLRenderingContext !== 'undefined';
const GL_CONST = {
  FLOAT: isBrowser ? WebGLRenderingContext.FLOAT : 5126,
  UNSIGNED_INT: isBrowser ? WebGLRenderingContext.UNSIGNED_INT : 5125,
  UNSIGNED_SHORT: isBrowser ? WebGLRenderingContext.UNSIGNED_SHORT : 5123,
  UNSIGNED_BYTE: isBrowser ? WebGLRenderingContext.UNSIGNED_BYTE : 5121,
} as const;

export const GPU_BUFFER_TYPE_INFO = {
  float32: {
    arrayType: Float32Array,
    setAttribPointer: resolveDefaultSetAttributePointer(GL_CONST.FLOAT, Float32Array.BYTES_PER_ELEMENT),
  },
  uint32: {
    arrayType: Uint32Array,
    setAttribPointer: resolveDefaultSetAttributePointer(GL_CONST.UNSIGNED_INT, Uint32Array.BYTES_PER_ELEMENT),
  },
  uint16: {
    arrayType: Uint16Array,
    setAttribPointer: resolveDefaultSetAttributePointer(GL_CONST.UNSIGNED_SHORT, Uint16Array.BYTES_PER_ELEMENT),
  },
  uint8: {
    arrayType: Uint8Array,
    setAttribPointer: resolveDefaultSetAttributePointer(GL_CONST.UNSIGNED_BYTE, Uint8Array.BYTES_PER_ELEMENT),
  },
  mat3x3: {
    arrayType: Float32Array,
    setAttribPointer: function (
        gl: WebGLRenderingContext,
        variableLoc: GLint,
        angleExtension: ANGLE_instanced_arrays | null,
        bufferView: GpuBufferView
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
  },
} as const satisfies Record<GpuBufferDataType, GpuBufferTypeInfo<any>>;

export function resolveGpuBufferDataType(type: GpuBufferDataType) {
  return GPU_BUFFER_TYPE_INFO[type];
}

export function resolveDefaultSetAttributePointer(
    glType?: number,
    bytesPerElement?: number
): SetAttribPointer {
  if (glType === undefined || bytesPerElement === undefined) {
    throw new Error('glType and bytesPerElement must be provided');
  }

  return function(
    gl: WebGLRenderingContext,
    variableLoc: number,
    angleExtension: ANGLE_instanced_arrays | null,
    bufferView: GpuBufferView,
    componentsPerInstance: number
  ): void {
    gl.enableVertexAttribArray(variableLoc);

    gl.vertexAttribPointer(
      variableLoc,
      componentsPerInstance,
      glType,
      false,
      0,
      bufferView.offset * bytesPerElement,
    );

    angleExtension?.vertexAttribDivisorANGLE(variableLoc, bufferView.vertexAttribDivisor);
  }
}
