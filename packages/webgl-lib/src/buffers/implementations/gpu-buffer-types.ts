import { TypedArray } from '../gpu-writable-buffer';

export type TypedArrayConstructor<T extends TypedArray> = {
  new (size: number): T;
};

export type GpuBufferDataType =  'float32' 
  | 'uint32' | 'uint16' | 'uint8'
  | 'int32' | 'int16' | 'int8'
  | 'vec2'| 'vec3' | 'vec4'
  | 'mat3x3';

export type GpuBufferTypeInfo<T extends TypedArray> = {
  /** TypedArray constructor for the component storage type (e.g., Float32Array). */
  arrayType: TypedArrayConstructor<T>;

  /** WebGL enum for the component data type (e.g., gl.FLOAT). */
  glType: number;

  /** Number of bytes per component (e.g., 4 for float32). */
  bytesPerComponent: number;

  /** Default number of components per attribute slot (e.g., 3 for vec3). */
  defaultAttributeSize: number;

  /** Default number of attribute slots required (e.g., 3 for mat3). */
  defaultComponentsPerAttribute: number;
};

const isBrowser = typeof WebGLRenderingContext !== 'undefined';
const GL_CONST = {
  FLOAT: isBrowser ? WebGLRenderingContext.FLOAT : 5126,
  UNSIGNED_INT: isBrowser ? WebGLRenderingContext.UNSIGNED_INT : 5125,
  UNSIGNED_SHORT: isBrowser ? WebGLRenderingContext.UNSIGNED_SHORT : 5123,
  UNSIGNED_BYTE: isBrowser ? WebGLRenderingContext.UNSIGNED_BYTE : 5121,
  INT: isBrowser ? WebGLRenderingContext.INT : 5124,
  BYTE: isBrowser ? WebGLRenderingContext.BYTE : 5120,
  SHORT: isBrowser ? WebGLRenderingContext.SHORT : 5122,

} as const;

export const GPU_BUFFER_TYPE_INFO = {
  float32: {
    arrayType: Float32Array,
    glType: GL_CONST.FLOAT,
    bytesPerComponent: Float32Array.BYTES_PER_ELEMENT,
    defaultAttributeSize: 1,
    defaultComponentsPerAttribute: 1
  },
  uint32: {
    arrayType: Uint32Array,
    glType: GL_CONST.UNSIGNED_INT,
    bytesPerComponent: Uint32Array.BYTES_PER_ELEMENT,
    defaultAttributeSize: 1,
    defaultComponentsPerAttribute: 1
  },
  uint16: {
    arrayType: Uint16Array,
    glType: GL_CONST.UNSIGNED_SHORT,
    bytesPerComponent: Uint16Array.BYTES_PER_ELEMENT,
    defaultAttributeSize: 1,
    defaultComponentsPerAttribute: 1
  },
  uint8: {
    arrayType: Uint8Array,
    glType: GL_CONST.UNSIGNED_BYTE,
    bytesPerComponent: Uint8Array.BYTES_PER_ELEMENT,
    defaultAttributeSize: 1,
    defaultComponentsPerAttribute: 1
  },
  int32: {
    arrayType: Uint32Array,
    glType: GL_CONST.INT,
    bytesPerComponent: Uint32Array.BYTES_PER_ELEMENT,
    defaultAttributeSize: 1,
    defaultComponentsPerAttribute: 1
  },
  int16: {
    arrayType: Uint16Array,
    glType: GL_CONST.SHORT,
    bytesPerComponent: Uint16Array.BYTES_PER_ELEMENT,
    defaultAttributeSize: 1,
    defaultComponentsPerAttribute: 1
  },
  int8: {
    arrayType: Uint8Array,
    glType: GL_CONST.BYTE,
    bytesPerComponent: Uint8Array.BYTES_PER_ELEMENT,
    defaultAttributeSize: 1,
    defaultComponentsPerAttribute: 1
  },
  vec2: {
    arrayType: Float32Array,
    glType: GL_CONST.FLOAT,
    bytesPerComponent: Float32Array.BYTES_PER_ELEMENT,
    defaultAttributeSize: 2,
    defaultComponentsPerAttribute: 1
  },
  vec3: {
    arrayType: Float32Array,
    glType: GL_CONST.FLOAT,
    bytesPerComponent: Float32Array.BYTES_PER_ELEMENT,
    defaultAttributeSize: 3,
    defaultComponentsPerAttribute: 1
  },
  vec4: {
    arrayType: Float32Array,
    glType: GL_CONST.FLOAT,
    bytesPerComponent: Float32Array.BYTES_PER_ELEMENT,
    defaultAttributeSize: 4,
    defaultComponentsPerAttribute: 1
  },
  mat3x3: {
    arrayType: Float32Array,
    glType: GL_CONST.FLOAT,
    bytesPerComponent: Float32Array.BYTES_PER_ELEMENT,
    defaultAttributeSize: 3,
    defaultComponentsPerAttribute: 3
  },
} as const satisfies Record<GpuBufferDataType, GpuBufferTypeInfo<any>>;

export function resolveGpuBufferDataType(type: GpuBufferDataType) {
  return GPU_BUFFER_TYPE_INFO[type];
}
