export class GpuFloatBuffer {
    private buffer: Float32Array;
    private bufferOffset = 0;
    private bufferEnd = 0;

    private componentsPerIteration: number;
    private currentDataVersion = -1;

    /** return a view of the buffer with the current data */
    public get data() {
        return this.buffer.subarray(this.bufferOffset, this.bufferEnd);
    }

    constructor(size: number, componentsPerIteration = 1) {
        this.buffer = new Float32Array(size * componentsPerIteration);
        this.bufferEnd = this.buffer.length;

        this.componentsPerIteration = componentsPerIteration;
        this.updateDataVersion();
    }

    /** returns a number that changes when the data changes */
    public get dataVersion() {
        return this.currentDataVersion;
    }

    private updateDataVersion() {
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


        console.log('GpuFloatBuffer: increese Capacity', newItems);

        // make the buffer larger
        const newBuffer = new Float32Array(this.buffer.length + Math.max(32, newItems));
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
    public pushRange(values: number[]) {
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

    /** this is the real buffer length */
    public get length(): number {
        return this.bufferOffset - this.bufferEnd;
    }

    /** this is the number of items in the buffer */
    public get count(): number {
        return this.data.length / this.componentsPerIteration;
    }

    public static generateFrom(src: GpuFloatBuffer, calc: (srcValue: number) => number): GpuFloatBuffer {
        const srcData = src.data;
        const newBuffer = new GpuFloatBuffer(srcData.length);
        const newData = newBuffer.data;
        
        for (let i = 0; i < newData.length; i++) {
            newData[i] = calc(srcData[i]);
        }
    
        return newBuffer;
    }

    public generate(calc: (index: number) => number): GpuFloatBuffer {
        const data = this.data;
        for (let i = 0; i < this.data.length; i++) {
            data[i] = calc(i);
        }

        this.updateDataVersion();

        return this;
    }

    public bindBuffer(gl: WebGLRenderingContext, variableLoc: GLint) {

        // Tell the attribute how to get data out of idBuffer (ARRAY_BUFFER)
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            variableLoc,
            this.componentsPerIteration,
            gl.FLOAT,
            normalize,
            stride,
            offset
        );
    }

}
