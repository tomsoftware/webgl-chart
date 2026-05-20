import { GpuBufferDataType, GpuBufferView, GpuFixBuffer, GpuReadableBuffer, TypedArray } from "@tomsoftware/webgl-lib";

/**
 * UniformSampler performs simple uniform downsampling on a 1D data buffer.
 * 
 * It selects evenly spaced samples from the input range [min, max],
 * based on the number of points requested by the renderer.
 * 
 * This is typically used for X‑coordinates in a LOD pipeline, where
 * Y‑values are reduced using Min/Max bins, but X‑values only need
 * a representative uniform stride.
 * 
 * Example:
 *   min = 1000
 *   max = 5000
 *   numberOfPoints = 2000
 *   → selects 2000 evenly spaced indices between 1000 and 5000
 */
export class UniformSampler<T extends TypedArray> {

    private readonly values: GpuReadableBuffer;

    public readonly result: GpuFixBuffer<T>;
    public readonly indexes: Uint32Array;

    /**
     * Creates a new UniformSampler.
     * @param values The source buffer containing the full‑resolution data.
     */
    public constructor(type: GpuBufferDataType, values: GpuReadableBuffer, numberOfPoints: number) {
        this.values = values;
        this.result = new GpuFixBuffer(type, numberOfPoints);
        this.indexes = new Uint32Array(numberOfPoints);
    }
    /**
     * Downsamples the buffer by selecting evenly spaced samples
     * between the given min and max values.
     * 
     * @param min The start value of the visible data range.
     * @param max The end value of the visible data range.
     * @param numberOfPoints The number of samples to return.
     * @returns A new array containing uniformly spaced samples.
     */
    public process(min: number, max: number, numberOfPoints: number) {
        // Sanity checks
        if (numberOfPoints <= 0) {
            this.result.clear();

            return {
                indexes: this.indexes,
                values: this.result
            };
        }

        // Find fist end last index
        const minIndexValue = this.values.findIndex(min);
        const maxIndexValue = this.values.findIndex(max);

        const startIndex = Math.min(minIndexValue, maxIndexValue);
        const endIndex = Math.max(minIndexValue, maxIndexValue);

        if (endIndex <= startIndex) {
            this.result.clear();

            return {
                indexes: this.indexes,
                values: this.result
            };
        }

        this.result.ensureCapacity(numberOfPoints);
        this.result.clear();

        // Only one value
        if (numberOfPoints === 1) {
            const midIndex = Math.round((startIndex + endIndex) * 0.5);
            const v = this.values.getComponentAt(midIndex, 0);
            this.result.push(v);
            this.indexes[0] = 0;

            return {
                indexes: this.indexes,
                values: this.result
            };
        }

        // more then one value
        const range = endIndex - startIndex;
        const step = range / (numberOfPoints - 1);

        for (let i = 0; i < numberOfPoints; i++) {
            let idx = startIndex + i * step;
            // round to integer / index
            idx = Math.round(idx);
            // clamp to man / min
            if (idx < startIndex) idx = startIndex;
            if (idx > endIndex) idx = endIndex;

            const value = this.values.getComponentAt(idx, 0);

            this.indexes[i] = idx;
            this.result.push(value);
        }

        return {
            indexes: this.indexes,
            values: this.result
        };
    }

}
