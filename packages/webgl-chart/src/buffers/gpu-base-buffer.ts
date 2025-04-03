import { GpuBufferView } from "./buffer-view";

type TypedArray =
  | Float32Array
  | Float64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array;

export class GpuBaseBuffer<T extends TypedArray> {
    protected buffer: T;
    protected bufferOffset = 0;
    protected bufferEnd = 0;
    private activator: { new(size: number): T };
    private typeName: string;

    protected componentsPerInstance: number;
    protected currentDataVersion = -1;

    /** return a view of the buffer with the current data */
    public get data() {
        return this.buffer.subarray(this.bufferOffset, this.bufferEnd);
    }

    /** return a value of a given item */
    public get(index: number) {
        const offset = this.bufferOffset + index * this.componentsPerInstance;
        return this.buffer.subarray(offset, offset + this.componentsPerInstance);
    }

    constructor(activator: { new(size: number): T }, size: number, typeName: string, componentsPerInstance : number) {
        this.buffer = new activator(size * componentsPerInstance);
        this.typeName = typeName;
        this.bufferEnd = 0;
        this.activator = activator;
        this.componentsPerInstance = componentsPerInstance;
        this.updateDataVersion();
    }

    /** returns a number that changes when the data changes */
    public get dataVersion() {
        return this.currentDataVersion;
    }

    protected updateDataVersion() {
        this.currentDataVersion++;
    }

    /** makes sure the current buffer can handle the given number of items */
    public ensureCapacity(size: number = 1) {
        size = Math.max(0, size);

        if (this.buffer.length >= this.bufferOffset + size) {
            // the buffer is large enough
            return;
        }

        console.log('GpuBuffer<' + this.typeName + '>: new capacity:', size);

        // make the buffer larger
        const newBuffer = new this.activator(this.bufferOffset + size);
        newBuffer.set(this.buffer);
        this.buffer = newBuffer;
    }

    /** makes sure the given number of new items fits into the internal buffer */
    public increaseCapacity(newItems: number = 1) {
        newItems = Math.max(0, newItems);

        if (this.buffer.length >= this.bufferEnd + newItems) {
            // the buffer is large enough
            return this;
        }

        // do not increase the buffer by less than 32 items
        newItems = Math.max(Math.max(newItems, 32), (this.buffer.length + 1) >> 1);

        this.ensureCapacity(this.buffer.length + Math.max(32, newItems));

        return this;
    }

    private pushValue(value: number) {
        if (this.bufferEnd >= this.buffer.length) {
            this.increaseCapacity();
        }

        this.buffer[this.bufferEnd] = value;
        this.bufferEnd++;
    }

    /** add a list of values to the buffer */
    public pushRange(values: number[] | TypedArray) {
        this.increaseCapacity(values.length);

        for (let i = 0; i < values.length; i++) {
            this.pushValue(values[i]);
        }

        this.updateDataVersion();
    }

    public push(...args: number[]) {
        this.pushRange(args);
    }

    public clear() {
        this.bufferOffset = 0;
        this.bufferEnd = 0;
        this.updateDataVersion();
    }

    protected setBasicVertexAttribPointer(
            gl: WebGLRenderingContext,
            variableLoc: number,
            angleExtension: ANGLE_instanced_arrays | null,
            bufferView: GpuBufferView,
            type: GLenum,
            bytesPerInstance: number,
        ) {

        // Turn on the attribute
        gl.enableVertexAttribArray(variableLoc);

        // Tell the attribute how to get data out of idBuffer (ARRAY_BUFFER)
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position

        gl.vertexAttribPointer(
            variableLoc,
            this.componentsPerInstance,
            type,
            normalize,
            stride,
            bufferView.offset * bytesPerInstance
        );

        angleExtension?.vertexAttribDivisorANGLE(variableLoc, bufferView.vertexAttribDivisor);
   }

    /** return the size = (count * componentsPerIteration) of the buffer */
    public get length(): number {
        return this.bufferEnd - this.bufferOffset;
    }

    /** return the number of items in the buffer */
    public get count(): number {
        return this.data.length / this.componentsPerInstance;
    }

    /** return the fist element */
    public get first() {
        if (this.length <= 0) {
            return null;
        }

        return this.buffer[this.bufferOffset];
    }

    /** return the last element */
    public get last() {
        if (this.length <= 0) {
            return null;
        }

        return this.buffer[this.bufferEnd - 1];
    }
}
