/**
 * Example usage of the new GpuBuffer API
 */

import { GpuBuffer } from './gpu-buffer';
import { GpuBufferView } from './gpu-buffer-view';

// Float32 buffer with 2 components per instance (e.g., 2D positions)
const floatBuffer = new GpuBuffer('float32', 100, 2);

// Matrix 3x3 buffer for transformations
const matrixBuffer = new GpuBuffer('mat3x3', 50, 1);

// UInt32 buffer for indices
const indexBuffer = new GpuBuffer('uint32', 1000, 1);

// UInt16 buffer
const uint16Buffer = new GpuBuffer('uint16', 500, 1);

// UInt8 buffer
const uint8Buffer = new GpuBuffer('uint8', 256, 1);


// ============================================================================
// New Feature: Rotated Buffer (Fixed Capacity, Circular)
// ============================================================================

// Standard buffer that grows dynamically
const dynamicBuffer = new GpuBuffer('float32', 100, 2, false);

// Rotated buffer with fixed capacity of 100 elements
// When you write beyond capacity, it wraps around and overwrites old data
const rotatedBuffer = new GpuBuffer('float32', 100, 2, true);

// Example usage:
dynamicBuffer.push(1.0, 2.0);       // Adds data
dynamicBuffer.pushRange([3.0, 4.0]); // Adds more data

rotatedBuffer.push(1.0, 2.0);       // Adds data
rotatedBuffer.pushRange([3.0, 4.0]); // Wraps around if needed

// For rotated buffers, useful properties:
// - rotatedBuffer.totalElementsWritten - total count (includes overwrites)
// - rotatedBuffer.writePosition - current write position in buffer
// - rotatedBuffer.buffer - the actual typed array


// ============================================================================
// Common Operations (Same for all types)
// ============================================================================

// Add values
floatBuffer.push(1.0, 2.0, 3.0, 4.0);
floatBuffer.pushRange([5.0, 6.0, 7.0, 8.0]);

// Clear buffer
floatBuffer.clear();

// Get properties
const dataVersion = floatBuffer.dataVersion;  // Changes when data is modified
const length = floatBuffer.length;            // Number of individual values
const count = floatBuffer.count;              // Number of items (length / componentsPerInstance)
const first = floatBuffer.first;              // First value
const last = floatBuffer.last;                // Last value
const data = floatBuffer.data;                // Raw typed array data

// Get a specific item
const item = floatBuffer.get(5);              // Get item at index 5

// Base buffer specific (not available on rotated buffers)
dynamicBuffer.ensureCapacity(200);            // Ensure buffer can hold 200 items
dynamicBuffer.increaseCapacity(50);           // Add capacity for 50 more items

// Generate with calculation function
const generated = new GpuBuffer('float32', 100, 1)
  .generate((i: number) => Math.sin(i * 0.1));

// Generate from another buffer
const transformed = GpuBuffer.generateFrom('float32', floatBuffer,
  (value: number) => value * 2
);

// Setup for WebGL
const glContext = {} as WebGLRenderingContext;
const location = 0;
const angleExtension = null as any;
const view = GpuBufferView.Default;

floatBuffer.setVertexAttribPointer(glContext, location, angleExtension, view);
