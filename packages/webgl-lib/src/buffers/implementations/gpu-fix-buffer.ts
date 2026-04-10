import { TypedArray } from '../gpu-writable-buffer';
import { GpuBufferBase } from './gpu-buffer-base';
import { GpuBufferDataType, resolveGpuBufferDataType } from './gpu-buffer-types';

/**
 * A fixed-size buffer that does not resize and does not wrap.
 */
export class GpuFixBuffer<T extends TypedArray> extends GpuBufferBase<T> {
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
            console.warn(`GpuFixBuffer<${this.typeName}>: requested capacity ${size} exceeds fixed capacity ${this.buffer.length}.`);
        }
    }

    public get(index: number): number[] {
        const offset = (index * this.componentsPerInstance);
        return Array.from(this.buffer.subarray(offset, offset + this.componentsPerInstance));
    }

    protected doPushRange(values: number[] | TypedArray): void {
        const freeSpace = this.buffer.length - this.validLength;
        if (freeSpace <= 0) {
            if (values.length > 0) {
                console.warn(`GpuFixBuffer<${this.typeName}>: push ignored because buffer is full.`);
            }
            return;
        }

        const itemsToWrite = Math.min(values.length, freeSpace);
        for (let i = 0; i < itemsToWrite; i++) {
            this.buffer[this.validLength] = values[i];
            this.validLength++;
        }

        if (itemsToWrite < values.length) {
            console.warn(`GpuFixBuffer<${this.typeName}>: truncated ${values.length - itemsToWrite} value(s) because capacity is fixed.`);
        }
    }
}