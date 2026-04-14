# Buffers

Buffers are used to store the data and manage the mapping between JavaScript and WebGL / GPU data. All buffer implementations conform to the `GpuWritableBuffer` interface, providing a consistent API across different data types and behaviors.


## Buffer Types

| Name | Type | Info |
| -----|------|------|
| `GpuBuffer<'float32'>` | 32 Bit Float |Floating Point Numbers|
| `GpuBuffer<'uint8'>`   | Unsigned 8 Bit | [0...255] Integer Numbers |
| `GpuBuffer<'uint16'>`  | Unsigned 16 Bit | [0...65535] Integer Numbers |
| `GpuBuffer<'uint32'>`  | Unsigned 32 Bit | [0...2^23-1] Integer Numbers |
| `GpuBuffer<'mat3x3'>`  | 9 × 32 Bit Float | 3×3 Floating Point Matrices |

## GpuWritableBuffer Interface

The common interface implemented by all GPU buffer types. Provides functionality for memory management, data access, and WebGL integration.


### Read-Only Properties (Getters)

Property  |  Type | Description
|---------| ------|------------
| `data` | TypedArray | Returns a subarray view containing only the valid data
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
constructor(type: GpuBufferDataType, size: number, componentsPerAttribute?: number);
constructor(type: GpuBufferDataType, values: number[]);
```

| Parameter              | Type               | Description                                      |
|-----------------------|--------------------|--------------------------------------------------|
| type                  | GpuBufferDataType | The data type of the buffer                      |
| values                | number[]          | Initial values (alternative to `size`)           |
| size                  | number            | Fixed buffer size                                |
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
constructor(type: GpuBufferDataType, size: number, componentsPerAttribute?: number);
constructor(type: GpuBufferDataType, values: number[]);
```

| Parameter              | Type               | Description                                      |
|-----------------------|--------------------|--------------------------------------------------|
| type                  | GpuBufferDataType | The data type of the buffer                      |
| values                | number[]          | Initial values (alternative to `size`)           |
| size                  | number            | Initial buffer size                              |
| componentsPerAttribute | number            | Components per item (default: `1`)               |

#### Specific Behavior

- Automatically increases capacity by at least 32 items or 50% growth, whichever is larger.
- Suitable for scenarios where data size is not known in advance.

#### Static Methods

```ts
static generateFrom(type: GpuBufferDataType, src: GpuReadableBuffer, calc: (srcValue: number) => number): GpuGrowingBuffer
```

Creates a new buffer by transforming values from an existing readable buffer.

| Parameter | Type                                   | Description                                |
|---------- |-----------------------------------------|--------------------------------------------|
| type      | GpuBufferDataType                      | Data type for the new buffer               |
| src       | GpuReadableBuffer                      | Source buffer                              |
| calc      | `(srcValue: number) => number`          | Mapping function applied to each value     |

**Returns:** `GpuGrowingBuffer`

---

```ts
static generate(type: GpuBufferDataType, length: number, calc: (index: number) => number): GpuGrowingBuffer
```

Creates a new buffer of the given length, filling it using a callback.

| Parameter | Type                          | Description                                  |
|---------- |-------------------------------|----------------------------------------------|
| type      | GpuBufferDataType             | Data type for the new buffer                 |
| length    | number                        | Number of generated values                   |
| calc      | `(index: number) => number`   | Callback returning the value for each index  |

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
constructor(type: GpuBufferDataType, size: number, componentsPerAttribute?: number);
constructor(type: GpuBufferDataType, values: number[]);
```

| Parameter              | Type               | Description                                      |
|-----------------------|--------------------|--------------------------------------------------|
| type                  | GpuBufferDataType | The data type of the buffer                      |
| values                | number[]          | Initial values (alternative to `size`)           |
| size                  | number            | Fixed buffer size                                |
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
