# Buffers

Buffers are used to store the data and manage the mapping between JavaScript and WebGL / GPU data. All buffer types inherit from `GpuBaseBuffer`, providing a consistent API across different data types.


## Buffer Types

| Name | Type | Info |
| -----|------|------|
| `GpuBuffer<'float32'>` | 32 Bit Float |Floating Point Numbers|
| `GpuBuffer<'uint8'>`   | Unsigned 8 Bit | [0...255] Integer Numbers |
| `GpuBuffer<'uint16'>`  | Unsigned 16 Bit | [0...65535] Integer Numbers |
| `GpuBuffer<'uint32'>`  | Unsigned 32 Bit | [0...2^23-1] Integer Numbers |
| `GpuBuffer<'mat3x3'>`  | 9 × 32 Bit Float | 3×3 Floating Point Matrices |

## GpuBaseBuffer

The base class for all GPU buffer implementations. Provides core functionality for memory management, data access, and WebGL integration.


### Read-Only Properties (Getters)

Property  |  Type | Description
|---------| ------|------------
| `data` | TypedArray | Returns a subarray view containing only the valid data
| `dataVersion` | number | Version counter that increments whenever data changes. Useful for caching optimizations
| `length` | number | Total size in components: (count * componentsPerInstance)
| `count` | number | Number of logical data items in the buffer
| `first` | number | null | Returns the first element, or null if buffer is empty
| `last` | number | null | Returns the last element, or null if buffer is empty


---

### Methods

#### Data Access

```ts
get(index: number): TypedArray
```

Returns the subarray representing the item at the given index.

| Parameter | Type   | Description            |
|---------- |--------|------------------------|
| index     | number | Item index to retrieve |

**Returns:** `TypedArray` : Subarray containing the components for that item

---

#### Capacity Management

```ts
ensureCapacity(size: number = 1): this
```

Ensures the buffer can handle the specified number of additional items.

| Parameter | Type   | Description                          |
|---------- |--------|--------------------------------------|
| size      | number | Minimum number of items to accommodate |

**Returns:** `this` : Enables method chaining

---

```ts
increaseCapacity(newItems: number = 1): this
```

Ensures space for new items. Automatically increases buffer size by at least **32 items** or **50% growth**, whichever is larger.

| Parameter | Type   | Description                          |
|---------- |--------|--------------------------------------|
| newItems  | number | Number of new items to accommodate    |

**Returns:** `this` : Enables method chaining

---

#### Data Manipulation

```ts
push(...values: number[]): this
```

Adds one or more individual values to the buffer.

| Parameter | Type      | Description        |
|---------- |-----------|--------------------|
| values    | number[]  | Values to append   |

**Returns:** `this`

---

```ts
pushRange(values: number[] | TypedArray): this
```

Adds a range of values to the buffer.

| Parameter | Type                     | Description              |
|---------- |---------------------------|--------------------------|
| values    | number[] \| TypedArray    | Array of values to append |

**Returns:** `this`

---

```ts
clear(): this
```

Resets the buffer, clearing all data while preserving allocated capacity.

**Returns:** `this`

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
findIndex(value: number): number | null
```

Finds the closest matching index for a given value using binary search.

| Parameter | Type   | Description        |
|---------- |--------|--------------------|
| value     | number | Value to search for |

**Returns:** `number | null` : Closest matching index, or `null` if the value is outside the range

---




## GpuBuffer('float32')

A concrete buffer implementation using 32‑bit floating‑point numbers (`Float32Array`).

---

### Constructor

```ts
// With initial values
constructor(values: number[], componentsPerInstance?: number)

// With size only
constructor(size: number, componentsPerInstance?: number)
```

| Parameter              | Type      | Description                                      |
|-----------------------|-----------|--------------------------------------------------|
| values                | number[]  | Initial values (alternative to `size`)           |
| size                  | number    | Initial buffer size                              |
| componentsPerInstance | number    | Components per item (default: `1`)               |

---

### Static Methods

```ts
static generateFrom(src: GpuBuffer, calc: (srcValue: number) => number): GpuBuffer<'float32'>
```

Creates a new float buffer by transforming values from an existing `GpuBuffer<'float32'>`.

| Parameter | Type                                   | Description                                |
|---------- |-----------------------------------------|--------------------------------------------|
| src       | `GpuBuffer<'float32'>`                        | Source buffer                              |
| calc      | `(srcValue: number) => number`          | Mapping function applied to each value     |

**Returns:** `GpuBuffer<'float32'>`

---

```ts
static generate(length: number, calc: (index: number) => number): GpuBuffer<'float32'>
```

Creates a new float buffer of the given length, filling it using a callback.

| Parameter | Type                          | Description                                  |
|---------- |-------------------------------|----------------------------------------------|
| length    | number                        | Number of generated values                   |
| calc      | `(index: number) => number`   | Callback returning the value for each index  |

**Returns:** `GpuBuffer<'float32'>`

---


### Usage Examples

#### Creating a Buffer

```ts
// Create with initial values
const positions = new GpuBuffer('float32',
    [3, 1.4, 1.5, 9, 2.6],
);

// Create with size only
const colors = new GpuBuffer('float32', 1000, 4);
// 1000 items, 4 components each (RGBA)

// Generate 256 values using callback
const indices = GpuBuffer('float32', numBars).generate(256, i => i);
```

---

#### Adding Data


```ts
// Add single values
buffer.push(1.0, 2.0, 3.0);

// Add range of values
buffer.pushRange([4.0, 5.0, 6.0, 7.0]);

// Clear buffer (keeps capacity)
buffer.clear();
```

<example-buffer-push />
<details>
  <summary>Source</summary>

  @[code](../../examples/example-buffer-push.vue)
</details>


---

#### Reading Data

```ts
// Get item at index
const item = buffer.get(5); // Returns TypedArray

// Access first/last
const first = buffer.first;
const last = buffer.last;

// Iterate over data
for (let i = 0; i < buffer.count; i++) {
    const value = buffer.get(i);
}
```


## Performance Notes

* **Data Versioning**: Use `dataVersion` to detect when buffer contents have changed. This enables efficient caching strategies in rendering pipelines.
* **Capacity Growth**: Buffers grow automatically when needed. Pre-allocating sufficient capacity with the constructor can improve performance for known data sizes.
* **Zero-Copy Views**: The data property returns a subarray view without copying, making it efficient for read operations.
