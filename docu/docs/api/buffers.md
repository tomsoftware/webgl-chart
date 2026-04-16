# Buffers

Buffers are used to store the data and manage the mapping between JavaScript and WebGL / GPU data. All buffer implementations conform to the `GpuWritableBuffer` interface, providing a consistent API across different data types and behaviors.

## Key Terms

| Term | Meaning |
|------|---------|
| `attribute` | A linked group of numbers stored in a buffer. This can represent a single color, an x‑ or y‑value, or a complete data record. |
| `component` | A single numeric value within a group, such as `x`, `y`, `r`, `g`, `b` or `a`. |
| `attributeSize` | The number of numeric values that make up one attribute entry — for example, 2 for a 2D point or 4 for a color. |
| `componentsPerAttribute` | The number of attributes that form one logical unit. For simple numeric series this is usually `1`, but for matrices or more complex structures it can be higher. |

## Buffer Types

| Name | Type | Info |
| -----|------|------|
| `GpuBuffer<'float32'>` | 32 Bit Float | Floating point numbers |
| `GpuBuffer<'uint8'>` | Unsigned 8 Bit | [0...255] Integer numbers |
| `GpuBuffer<'uint16'>` | Unsigned 16 Bit | [0...65535] Integer numbers |
| `GpuBuffer<'uint32'>` | Unsigned 32 Bit | [0...2^23-1] Integer numbers |
| `GpuBuffer<'int8'>` | Signed 8 Bit | [-128...127] Integer numbers |
| `GpuBuffer<'int16'>` | Signed 16 Bit | [-32768...32767] Integer numbers |
| `GpuBuffer<'int32'>` | Signed 32 Bit | Full signed integer range |
| `GpuBuffer<'vec2'>` | vec2 | 2-component floating point vector |
| `GpuBuffer<'vec3'>` | vec3 | 3-component floating point vector |
| `GpuBuffer<'vec4'>` | vec4 | 4-component floating point vector |
| `GpuBuffer<'mat3x3'>` | mat3x3 | 3×3 floating point matrix |

## GpuWritableBuffer Interface

The common interface implemented by all GPU buffer types. Provides functionality for memory management, data access, and WebGL integration.


### Read-Only Properties (Getters)

Property  |  Type | Description
|---------| ------|------------
| `data` | ArrayBufferView | Returns a view containing only the valid data
| `dataVersion` | number | Version counter that increments whenever data changes. Useful for caching optimizations
| `length` | number | Total size in components: (count * componentsPerAttribute)
| `count` | number | Number of logical data items in the buffer
| `firstAttribute` | number[] | Returns the first element, or empty array if buffer is empty
| `lastAttribute` | number[] | Returns the last element, or empty array if buffer is empty


---

### Methods

#### Data Access

```ts
getAttributeAt(index: number): number[]
```

Retrieves the attribute at the given *logical* index.   
Index `0` corresponds to the **oldest** stored attribute,   
index `validLength - 1` to the **most recently** written one.   

Each returned array contains exactly `componentsPerAttribute` numeric components.

| Parameter | Type   | Description            |
|---------- |--------|------------------------|
| index     | number | Item index to retrieve |

**Returns:** `number[]` : Array containing the components for that attribute or an empty array `[]` for out of bounce.

---

#### Component Access

```ts
getComponentAt(attributeIndex: number, componentIndex?: number): number
```

Returns a single component value from the specified attribute.

| Parameter        | Type   | Description                                  |
|------------------|--------|----------------------------------------------|
| attributeIndex   | number | Logical attribute index                      |
| componentIndex   | number | Component index within the attribute (default `0`) |

**Returns:** `number` : The requested component value.

---

#### Data Mutation

```ts
setAttributeAt(attributeIndex: number, values: number[]): void
```

Writes all components of an attribute at the given logical index.

| Parameter        | Type        | Description                            |
|------------------|-------------|----------------------------------------|
| attributeIndex   | number      | Logical attribute index                |
| values           | number[]    | Component values for the attribute     |

---

```ts
setComponentAt(attributeIndex: number, componentIndex: number, value: number): void
```

Writes a single component of an attribute at the given logical index.

| Parameter        | Type   | Description                                  |
|------------------|--------|----------------------------------------------|
| attributeIndex   | number | Logical attribute index                      |
| componentIndex   | number | Component index within the attribute         |
| value            | number | New component value                          |

---

```ts
setVertexAttribPointer(
  gl: WebGLRenderingContext,
  variableLoc: number,
  angleExtension: ANGLE_instanced_arrays | null,
  bufferView: GpuBufferView
): void
```

Configures WebGL vertex attribute pointers for this buffer.

> Note: This method is mainly relevant when writing custom shaders or advanced WebGL buffer bindings. For normal chart usage you usually do not need to call it directly.

| Parameter        | Type | Description |
|------------------|------|-------------|
| gl               | WebGLRenderingContext | WebGL context |
| variableLoc      | number | Base attribute location |
| angleExtension   | ANGLE_instanced_arrays \| null | Optional instancing extension |
| bufferView       | GpuBufferView | Buffer layout information |

---

#### Capacity Management

```ts
ensureCapacity(size: number): this
```

Ensures the buffer can handle at least the specified total number of items.

| Parameter | Type   | Description                          |
|---------- |--------|--------------------------------------|
| size      | number | Minimum total number of items to accommodate |

**Returns:** `this` : Enables method chaining

---

```ts
increaseCapacity(newItems: number): this
```

Ensures space for additional items. Growth strategy depends on the implementation.

| Parameter | Type   | Description                          |
|---------- |--------|--------------------------------------|
| newItems  | number | Number of new items to accommodate    |

**Returns:** `this` : Enables method chaining

---

#### Data Manipulation

```ts
push(...values: number[]): void
```

Adds one or more individual values to the buffer.

| Parameter | Type      | Description        |
|---------- |-----------|--------------------|
| values    | number[]  | Values to append   |

---

```ts
pushRange(values: number[] | TypedArray): void
```

Adds a range of values to the buffer.

| Parameter | Type                     | Description              |
|---------- |---------------------------|--------------------------|
| values    | number[] \| TypedArray    | Array of values to append |

---

```ts
clear(): void
```

Resets the buffer, clearing all data while preserving allocated capacity.

---

```ts
generate(calc: (i: number) => number): this
```

Replaces all buffer values using a callback function.

| Parameter | Type                     | Description                                      |
|---------- |---------------------------|--------------------------------------------------|
| calc      | `(i: number) => number`  | Callback receiving the index and returning value |

**Returns:** `this`

---

#### Search

```ts
findIndex(value: number): number
```

Finds the closest matching index for a given value using binary search.

| Parameter | Type   | Description        |
|---------- |--------|--------------------|
| value     | number | Value to search for |

**Returns:** `number` : Closest matching index, or -1 if the value is outside the range

---

## Buffer Implementations

There are several buffer implementations, each with different capacity management strategies:

- **GpuFixBuffer**: Fixed-size buffer that does not resize. Useful for static data.
- **GpuGrowingBuffer**: Dynamically growing buffer. Suitable for data that grows over time.
- **GpuRingBuffer**: Circular buffer that wraps around when full. Ideal for streaming data.

### GpuFixBuffer

A fixed-size buffer that does not resize and does not wrap. When the buffer is full, additional data is ignored or truncated.

#### Constructor

```ts
constructor(type: GpuBufferDataType, size: number, attributeSize?: number, componentsPerAttribute?: number);
constructor(type: GpuBufferDataType, values: number[]);
```

| Parameter              | Type               | Description                                      |
|-----------------------|--------------------|--------------------------------------------------|
| type                  | GpuBufferDataType | The data type of the buffer                      |
| values                | number[]          | Initial values (alternative to `size`)           |
| size                  | number            | Fixed buffer size                                |
| attributeSize         | number            | Number of components per vertex attribute slot (default from type info) |
| componentsPerAttribute | number            | Components per item (default: `1`)               |

#### Specific Behavior

- Capacity is fixed and cannot be increased.
- Pushing data beyond capacity results in warnings and data truncation.

####  Example

Fix size buffer example where y-values getting updated by moving position of mouse courser. No new data-points are added.

<example-buffer-write />
<details>
  <summary>Source</summary>

  @[code](../../examples/example-buffer-write.vue)
</details>




### GpuGrowingBuffer

A buffer that grows dynamically as needed. Suitable for data that accumulates over time.

#### Constructor

```ts
constructor(type: GpuBufferDataType, size: number, attributeSize?: number, componentsPerAttribute?: number);
constructor(type: GpuBufferDataType, values: number[]);
```

| Parameter              | Type               | Description                                      |
|-----------------------|--------------------|--------------------------------------------------|
| type                  | GpuBufferDataType | The data type of the buffer                      |
| values                | number[]          | Initial values (alternative to `size`)           |
| size                  | number            | Initial buffer size                              |
| attributeSize         | number            | Number of components per vertex attribute slot (default from type info) |
| componentsPerAttribute | number            | Components per item (default: `1`)               |

#### Specific Behavior

- Automatically grows by at least doubling the current capacity and aligning the new buffer to a 256-byte boundary.
- Suitable for scenarios where data size is not known in advance.

#### Static Methods

```ts
static generateFrom(type: GpuBufferDataType, source: GpuReadableBuffer, func: (srcValue: number) => number): GpuGrowingBuffer
```

Creates a new buffer by transforming values from an existing readable buffer.

| Parameter | Type                                   | Description                                |
|---------- |-----------------------------------------|--------------------------------------------|
| type      | GpuBufferDataType                      | Data type for the new buffer               |
| source    | GpuReadableBuffer                      | Source buffer                              |
| func      | `(srcValue: number) => number`          | Mapping function applied to each value     |

**Returns:** `GpuGrowingBuffer`

#### Usage Examples

<example-buffer-push />
<details>
  <summary>Source</summary>

  @[code](../../examples/example-buffer-push.vue)
</details>

### GpuRingBuffer

A circular buffer that reuses fixed allocated memory. When the write pointer reaches the end, it wraps back to the beginning.

#### Constructor

```ts
constructor(type: GpuBufferDataType, size: number, attributeSize?: number, componentsPerAttribute?: number);
constructor(type: GpuBufferDataType, values: number[]);
```

| Parameter              | Type               | Description                                      |
|-----------------------|--------------------|--------------------------------------------------|
| type                  | GpuBufferDataType | The data type of the buffer                      |
| values                | number[]          | Initial values (alternative to `size`)           |
| size                  | number            | Fixed buffer size                                |
| attributeSize         | number            | Number of components per vertex attribute slot (default from type info) |
| componentsPerAttribute | number            | Components per item (default: `1`)               |

#### Specific Behavior

- Fixed capacity; data wraps around when full.
- Older data is overwritten by new data.
- Useful for sliding windows or real-time data streams.

#### Additional Methods

```ts
clear(): this
```

Resets the buffer and write pointer to the beginning.

**Returns:** `this`

#### Usage Examples

<example-buffer-ring />
<details>
  <summary>Source</summary>

  @[code](../../examples/example-buffer-ring.vue)
</details>

## Performance Notes

* **Data Versioning**: Use `dataVersion` to detect when buffer contents have changed. This enables efficient caching strategies in rendering pipelines.
* **Capacity Growth**: For GpuGrowingBuffer, pre-allocating sufficient capacity with the constructor can improve performance for known data sizes.
* **Zero-Copy Views**: The data property returns a subarray view without copying, making it efficient for read operations.
* **Choose the Right Implementation**: Use GpuFixBuffer for static data, GpuGrowingBuffer for growing datasets, and GpuRingBuffer for streaming data with fixed history.
