export class GpuBuffer {
    public data: Float32Array;
    private componentsPerIteration: number;
    private currentDataVersion = -1;

    constructor(size: number, componentsPerIteration = 1) {
        this.data = new Float32Array(size * componentsPerIteration);
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

    /** add a list of vaues to the buffer */
    public pushRange(values: number[]) {
        // todo: optimise!
        this.data = new Float32Array([...this.data, ...values]);
        this.updateDataVersion();
    }

    public push(...args: number[]) {
        this.pushRange(args);
    }

    public clear() {
        // todo: optimise!
        this.data = new Float32Array(0);
        this.updateDataVersion();
    }

    /** this is the real buffer length */
    public get length(): number {
        return this.data.length;
    }

    /** this is the number of items in the buffer */
    public get count(): number {
        return this.data.length / this.componentsPerIteration;
    }

    public generate(calc: (index: number) => number): GpuBuffer {
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
