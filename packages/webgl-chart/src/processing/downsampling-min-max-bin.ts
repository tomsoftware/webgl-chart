import { GpuBufferDataType, GpuFixBuffer, GpuReadableBuffer, TypedArray } from "@tomsoftware/webgl-lib";

/**
 * DownsamplingMinMaxBin computes per‑bin minimum and maximum values
 * for a given input buffer. 
 */
export class DownsamplingMinMaxBin<T extends TypedArray>  {
    public readonly minValues: GpuFixBuffer<T>;
    public readonly maxValues: GpuFixBuffer<T>;
    private readonly values: GpuReadableBuffer;

    /**
     * Creates a new Min/Max downsampler.
     * @param values The source buffer containing the full dataset.
     */
    public constructor(type: GpuBufferDataType, values: GpuReadableBuffer, numberOfPoints: number) {
        this.values = values;
        this.minValues = new GpuFixBuffer(type, numberOfPoints);
        this.maxValues = new GpuFixBuffer(type, numberOfPoints);
    }

    /**
     * Computes the minValues and maxValues for each bin.
     */
    public process(binIndexes: Uint32Array) {
        const binCount = binIndexes.length;
        this.minValues.ensureCapacity(binCount);
        this.maxValues.ensureCapacity(binCount);

        this.minValues.clear();
        this.maxValues.clear();

        const values = this.values;

        let binIndex = 0;
        const startIndex = binIndexes[0];
        const endIndex = Math.min(values.count, binIndexes[binIndexes.length - 1] + 1);
        let nextIndex = binIndexes[binIndex + 1];

        let min = values.getComponentAt(startIndex);
        let max = min;

        for (let i = startIndex; i <= endIndex; i++) {
            const v = values.getComponentAt(i);

            if (i < nextIndex) {
                // update state
                if (v < min) min = v;
                if (v > max) max = v;
            }
            else {
                // we reach next bin
                // save value
                this.minValues.push(min);
                this.maxValues.push(max);

                // save next bin
                binIndex++;
                nextIndex = binIndexes[binIndex + 1];

                // create new state
                min = v;
                max = min;
            }
        }

        return { min: this.minValues, max: this.maxValues };
    }
}
