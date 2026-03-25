import { ArrayUtilities, TypedArray } from './array-utilities';
import { GpuBufferView } from './gpu-buffer-view';

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
    public ensureCapacity(size: number = 1): this {
        size = Math.max(0, size);

        if (this.buffer.length >= this.bufferOffset + size) {
            // the buffer is large enough
            return this;
        }

        console.log('GpuBuffer<' + this.typeName + '>: new capacity:', size);

        // make the buffer larger
        const newBuffer = new this.activator(this.bufferOffset + size);
        newBuffer.set(this.buffer);
        this.buffer = newBuffer;

        return this;
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

    public clear(): this {
        this.bufferOffset = 0;
        this.bufferEnd = 0;
        this.updateDataVersion();
        return this;
    }

   /** Return the closes index a given value matches in the buffer-values */
    public findIndex(value: number): number | null {
        var range = ArrayUtilities.guessIndexRange(this.buffer, this.bufferOffset, this.bufferEnd - 1, value);
        if (range == null) {
            // value is outside of the arrays values
            if (value < this.buffer[this.bufferOffset]) {
                // value is before the first element
                return this.bufferOffset;
            }
            // value is after last element
            return this.bufferEnd - 1;
        }

        // value is inside the array -> get best index
        const pos = ArrayUtilities.binarySearch(this.buffer, range[0], range[1], value);
        const low = pos[0];
        const high = pos[1];

        // check what is closer low or high to given value
        if (Math.abs(value - this.buffer[low]) < Math.abs(value - this.buffer[high])) {
            return low;
        }

        return high;
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

    /** generate data from a given buffer: result[i] = calc(src[i]) */
    protected static generateFromBase<T extends TypedArray, B extends GpuBaseBuffer<T>>(
        ctor: new (size: number) => B,
        src: B,
        calc: (srcValue: number) => number
    ): B {
        const srcData = src.data;
        const newBuffer = new ctor(srcData.length);
        newBuffer.bufferOffset = 0;
        newBuffer.bufferEnd = srcData.length;
        const newData = newBuffer.buffer;
        
        for (let i = 0; i < newData.length; i++) {
            newData[i] = calc(srcData[i]);
        }
    
        return newBuffer;
    }

     /** generate buffer with the given number of elements: = calc(i) */
    protected static generateBase<T extends TypedArray, B extends GpuBaseBuffer<T>>(
        ctor: new (size: number) => B,
        length: number,
        calc: (index: number) => number
    ): B {
        const newBuffer = new ctor(length);
        newBuffer.bufferOffset = 0;
        newBuffer.bufferEnd = length;
        const newData = newBuffer.buffer;
        for (let i = 0; i < length; i++) {
            newData[i] = calc(i);
        }
    
        return newBuffer;
    }

    /** replace all buffers-values with a callback  */
    public generate(calc: (i: number) => number): this {
        this.bufferOffset = 0;
        this.bufferEnd = this.buffer.length;

        const data = this.data;
        for (let i = 0; i < data.length; i++) {
            data[i] = calc(i);
        }

        this.updateDataVersion();

        return this;
    }
}
