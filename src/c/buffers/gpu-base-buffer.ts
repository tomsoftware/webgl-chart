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

    protected componentsPerIteration: number;
    protected currentDataVersion = -1;

    /** return a view of the buffer with the current data */
    public get data() {
        return this.buffer.subarray(this.bufferOffset, this.bufferEnd);
    }

    /** return a value of a given item */
    public get(index: number) {
        const offset = this.bufferOffset + index * this.componentsPerIteration;
        return this.buffer.subarray(offset, offset + this.componentsPerIteration);
    }

    constructor(activator: { new(size: number): T }, size: number, componentsPerIteration: number) {
        this.buffer = new activator(size * componentsPerIteration);
        this.bufferEnd = this.buffer.length;
        this.activator = activator;
        this.componentsPerIteration = componentsPerIteration;
        this.updateDataVersion();
    }

    /** returns a number that changes when the data changes */
    public get dataVersion() {
        return this.currentDataVersion;
    }

    protected updateDataVersion() {
        this.currentDataVersion++;
    }

    /** makes sure the given number of new itmes fits into the internal buffer */
    public increeseCapacity(newItems: number = 1) {
        newItems = Math.max(0, newItems);

        if (this.buffer.length >= this.bufferEnd + newItems) {
            // the buffer is large enough
            return;
        }

        // do not increase the buffer by less than 32 items
        newItems = Math.max(Math.max(newItems, 32), this.buffer.length / 2);


        console.log('GpuBufferShort: increese Capacity', newItems);

        // make the buffer larger
        const newBuffer = new this.activator(this.buffer.length + Math.max(32, newItems));
        newBuffer.set(this.buffer);
        this.buffer = newBuffer;
    }

    private pushValue(value: number) {
        if (this.bufferEnd >= this.buffer.length) {
            this.increeseCapacity();
        }

        this.buffer[this.bufferEnd] = value;
        this.bufferEnd++;
    }

    /** add a list of vaues to the buffer */
    public pushRange(values: number[] | TypedArray) {
        this.increeseCapacity(values.length);

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

    /** return the size = (count * componentsPerIteration) of the buffer */
    public get length(): number {
        return this.bufferEnd - this.bufferOffset;
    }

    /** return the number of items in the buffer */
    public get count(): number {
        return this.data.length / this.componentsPerIteration;
    }

}
