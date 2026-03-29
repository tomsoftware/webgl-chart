import { GpuBufferView } from '../gpu-buffer-view';
import { TypedArray } from '../i-gpu-buffer';
import { IGpuBufferImpl } from './gpu-buffer-base';

/**
 * A circular buffer that reuses fixed allocated memory.
 * When the write pointer reaches the end, it wraps back to the beginning.
 * This is useful for scenarios like real-time data streaming where old data
 * can be overwritten by new data.
 */
export class GpuRingBuffer<T extends TypedArray> implements IGpuBufferImpl<T> {
    public buffer: T;
    protected writeOffset = 0;
    protected totalWritten = 0;
    private activator: { new(size: number): T };
    private typeName: string;
    protected componentsPerInstance: number;
    private currentDataVersion = -1;

    /**
     * Get all data in the buffer (may contain old and new data mixed due to rotation)
     */
    public get data(): T {
        return this.buffer;
    }

    /**
     * Get a value at a given index within the buffer
     */
    public get(index: number): number[] {
        const offset = (index * this.componentsPerInstance) % this.buffer.length;
        return Array.from(this.buffer.subarray(offset, offset + this.componentsPerInstance));
    }

    public constructor(
        activator: { new(size: number): T },
        size: number,
        typeName: string,
        componentsPerInstance: number
    ) {
        this.buffer = new activator(size * componentsPerInstance);
        this.typeName = typeName;
        this.activator = activator;
        this.componentsPerInstance = componentsPerInstance;
        this.writeOffset = 0;
        this.totalWritten = 0;
        this.updateDataVersion();
    }

    generate(calc: (i: number) => number): unknown {
        throw new Error('Method not implemented.');
    }

    public get capacity() {
        return this.buffer.length;
    }

    increaseCapacity(newItems: number | undefined): unknown {
        throw new Error('Method not implemented.');
    }
    ensureCapacity(size: number | undefined): void {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns a number that changes when the data changes
     */
    public get dataVersion(): number {
        return this.currentDataVersion;
    }

    public updateDataVersion(): void {
        this.currentDataVersion++;
    }

    /**
     * Expose updateDataVersion for external use
     */
    public get _updateDataVersion() {
        return () => this.updateDataVersion();
    }

    /**
     * Add a single value to the buffer (wrapped around if necessary)
     */
    private pushValue(value: number): void {
        this.buffer[this.writeOffset] = value;
        this.writeOffset = (this.writeOffset + 1) % this.buffer.length;
        this.totalWritten++;
    }

    /**
     * Add a list of values to the buffer
     */
    public pushRange(values: number[] | TypedArray): void {
        for (let i = 0; i < values.length; i++) {
            this.pushValue(values[i]);
        }
        this.updateDataVersion();
    }

    /**
     * Add one or more individual values to the buffer
     */
    public push(...args: number[]): void {
        this.pushRange(args);
    }

    /**
     * Reset the write pointer to the beginning
     */
    public clear(): this {
        this.writeOffset = 0;
        this.totalWritten = 0;
        this.updateDataVersion();
        return this;
    }

    /**
     * Get the total number of elements written (not accounting for wraparound)
     */
    public get totalElementsWritten(): number {
        return this.totalWritten;
    }

    /**
     * Get the current write position in the buffer
     */
    public get writePosition(): number {
        return this.writeOffset;
    }

    /**
     * Return the size of the buffer (number of individual values it can hold)
     */
    public get length(): number {
        return this.buffer.length;
    }

    /**
     * Return the number of items (considering componentsPerInstance)
     */
    public get count(): number {
        return this.buffer.length / this.componentsPerInstance;
    }

    public binarySearch(value: number): number | null {
        return null;
    }

    /**
     * Set up vertex attribute pointer for WebGL
     */
    public setVertexAttribPointer(
        gl: WebGLRenderingContext,
        variableLoc: number,
        angleExtension: ANGLE_instanced_arrays | null,
        bufferView: GpuBufferView,
        type: GLenum,
        bytesPerInstance: number
    ): void {
        gl.enableVertexAttribArray(variableLoc);

        const normalize = false;
        const stride = 0;

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
}
