import { GpuReadableBuffer } from '../gpu-readable-buffer';
import { TypedArray } from '../gpu-writable-buffer';
import { GpuBufferBase } from './gpu-buffer-base';
import { GpuBufferDataType, resolveGpuBufferDataType } from './gpu-buffer-types';

export class GpuGrowingBuffer<T extends TypedArray> extends GpuBufferBase<T> {
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

    /** Makes sure the current buffer can handle the given number of items */
    protected doEnsureCapacity(size: number): void {
        if (this.buffer.length >= size) {
            // the buffer is large enough
            return;
        }

        console.trace('GpuGrowingBuffer<' + this.typeName + '>: new capacity:', size);

        // make the buffer larger
        const newBuffer = new this.activator(size);
        newBuffer.set(this.buffer);
        this.buffer = newBuffer;
    }

    /** Add a list of values to the buffer */
    protected doPushRange(values: number[] | TypedArray): void {
        this.doEnsureCapacity(this.validLength + values.length);

        for (let i = 0; i < values.length; i++) {
            this.buffer[this.validLength] = values[i];
            this.validLength++;
        }
    }

    public get(index: number): number[] {
        const offset = (index * this.componentsPerInstance);
        return Array.from(this.buffer.subarray(offset, offset + this.componentsPerInstance));
    }

    /** Creates a new buffer from an existing readable buffer, applying a transformation function to each element */
    static generateFrom(type: GpuBufferDataType, source: GpuReadableBuffer, func: (srcValue: number) => number) {
        const newBuffer = new GpuGrowingBuffer(type, source.length);

        for (let i = 0; i < source.length; i++) {
            const srcValue = source.get(i);
            newBuffer.push(func(srcValue[0]));
        }

        return newBuffer;
    }
}
