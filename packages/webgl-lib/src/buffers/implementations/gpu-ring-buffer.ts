import { TypedArray } from '../gpu-writable-buffer';
import { GpuBufferBase } from './gpu-buffer-base';
import { GpuBufferDataType, resolveGpuBufferDataType } from './gpu-buffer-types';

/**
 * A circular buffer that reuses fixed allocated memory.
 * When the write pointer reaches the end, it wraps back to the beginning.
 */
export class GpuRingBuffer<T extends TypedArray> extends GpuBufferBase<T> {
    /** The current position in the buffer where new data will be written */
    protected writePosition: number = 0;

    public constructor(type: GpuBufferDataType, size: number, componentsPerInstance?: number);
    public constructor(type: GpuBufferDataType, values: number[]);
    public constructor(
        type: GpuBufferDataType,
        sizeOrValues: number | number[],
        componentsPerInstance = 1,
    ) {
        const info = resolveGpuBufferDataType(type);
        super(
            info.arrayType as unknown as { new(size: number): T },
            sizeOrValues,
            type,
            componentsPerInstance,
            info.setAttribPointer
        );
    }

    protected doEnsureCapacity(size: number): void {
        if (size > this.buffer.length) {
            console.warn(`GpuRingBuffer<${this.typeName}>: requested capacity ${size} exceeds current capacity ${this.buffer.length}. Consider using GpuGrowingBuffer for dynamic resizing.`);
        }
    }

    /**
     * Add a list of values to the buffer
     */
    protected doPushRange(values: number[] | TypedArray): void {
        if (this.buffer.length === 0) {
            return;
        }

        for (let i = 0; i < values.length; i++) {
            this.buffer[this.writePosition] = values[i];
            this.writePosition = (this.writePosition + 1) % this.buffer.length;
        }
        this.validLength = Math.min(this.validLength + values.length, this.buffer.length);
    }

    /**
     * Reset the write pointer to the beginning
     */
    public clear(): this {
        super.clear();
        this.writePosition = 0;
        return this;
    }

    public get(index: number): number[] {
        const offset = (index * this.componentsPerInstance) % this.buffer.length;
        return Array.from(this.buffer.subarray(offset, offset + this.componentsPerInstance));
    }
}
