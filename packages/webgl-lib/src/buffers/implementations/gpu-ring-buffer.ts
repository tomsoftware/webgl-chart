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

    private copyLastValueToBeginning: boolean = false;
    private breakAfterWritePosition: boolean = false;

    public constructor(type: GpuBufferDataType, size: number, attributeSize?: number, componentsPerAttribute?: number);
    public constructor(type: GpuBufferDataType, values: number[]);
    public constructor(
        type: GpuBufferDataType,
        sizeOrValues: number | number[],
        attributeSize?: number,
        componentsPerAttribute?: number
    ) {
        const info = resolveGpuBufferDataType(type);
        super(
            info.arrayType as unknown as { new(size: number): T },
            sizeOrValues,
            type,
            attributeSize ?? info.defaultAttributeSize,
            componentsPerAttribute ?? info.defaultComponentsPerAttribute,
            info.glType,
            info.bytesPerComponent
        );
    }

    protected doEnsureCapacity(size: number): void {
        if (size > this.buffer.length) {
            console.warn(`GpuRingBuffer<${this.typeName}>: requested capacity ${size} exceeds current capacity ${this.buffer.length}. Consider using GpuGrowingBuffer for dynamic resizing.`);
        }
    }

    /**
     *  Enables / disables value coping on buffer wrapping so
     *    buffer[0] = buffer[buffer.length - 1]
     * This is useful for line series so line is not breaking on end 
     *   of physical buffer. E.g.
     * Values to write:
     *   [5, 6, 7, 8, 9]
     * This will cause the resulting buffer to be (when writePosition = buffer.length - 3):
     *   [7, 8, 9 ..... 5, 6, 7]
     * So value 7 is repeated and the line is drawn:
     *   7->8, 8->9 ... 5->7, 6->7
    */
    public setCopyLastValueToBeginning(value: boolean): this {
        this.copyLastValueToBeginning = value;
        return this;
    }

    /**
     * Enables / disables adding of NaN value after write position. This breaks
     *   rendering of lines when the buffer is wrapped. So no line from 
     *   newest-datapoint to oldest-datapoint
     * Do not use this for buffers used for time-values cause it breaks .findIndex()
     */
    public setBreakAfterWritePosition(value: boolean): this {
        this.breakAfterWritePosition = value;
        return this;
    }

    private doPushRangeInternal(values: number[] | TypedArray) {
        for (let i = 0; i < values.length; i++) {
            this.buffer[this.writePosition] = values[i];
            this.writePosition = (this.writePosition + 1) % this.buffer.length;
        }

        if (this.breakAfterWritePosition) {
            // add NaN at the end
            this.buffer[this.writePosition] = NaN;
        }

        if (this.validLength < this.buffer.length) {
            // buffer is not filled yet
            if (this.writePosition === 0) {
                // because of "mod buffer.length" the full length will never be set with out this case
                this.validLength = this.buffer.length;
            } else if (this.breakAfterWritePosition) {
                // add also the NaN to the valid length
                this.validLength = Math.max(this.writePosition + 1, this.validLength);
            }
            else {
                this.validLength = Math.max(this.writePosition, this.validLength);
            }

        }
    }

    /**
     * Add a list of values to the circular buffer.
     */
    protected doPushRange(values: number[] | TypedArray): void {
        if (this.buffer.length === 0) {
            return;
        }

        if (this.copyLastValueToBeginning) {
            const remaining = this.buffer.length - this.writePosition;

            if (values.length >= remaining) {
                // First part fits into the remaining space
                const firstPart = values.slice(0, remaining);
                // Second part wraps around to the beginning
                const secondPart = values.slice(remaining - 1);

                // Write the part that fits until the end
                this.doPushRangeInternal(firstPart);
                //  Write the wrapped part starting at index 0
                this.doPushRangeInternal(secondPart)
            }
            else {
                this.doPushRangeInternal(values);
            }
        }
        else {
            this.doPushRangeInternal(values);
        }
    }

    /**
     * Reset the write pointer to the beginning
     */
    public clear(): this {
        super.clear();
        this.writePosition = 0;
        return this;
    }

    /** Converts a logical attribute index into the physical buffer index */
    protected resolvePhysicalIndex(logicalIndex: number): number {
        if (logicalIndex < 0 || logicalIndex >= this.validLength) {
            throw new RangeError(`Index ${logicalIndex} out of range (0..${this.validLength - 1})`);
        }

        const oldest = (this.writePosition - this.validLength + this.buffer.length) % this.buffer.length;
        const offset =  (oldest + logicalIndex) % this.buffer.length;
        return offset * this.totalComponents;
    }


}
