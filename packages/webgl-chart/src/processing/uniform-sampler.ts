import { GpuBufferView, GpuFixBuffer, GpuReadableBuffer } from "@tomsoftware/webgl-lib";

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
export class UniformSampler {

    private readonly values: GpuReadableBuffer;

    public readonly result = new GpuFixBuffer('float32', 100);

    /**
     * Creates a new UniformSampler.
     * @param values The source buffer containing the full‑resolution data.
     */
    public constructor(values: GpuReadableBuffer) {
        this.values = values;
    }
    /**
     * Downsamples the buffer by selecting evenly spaced samples
     * between the given min and max indices.
     * 
     * @param min The start index of the visible data range.
     * @param max The end index of the visible data range.
     * @param numberOfPoints The number of samples to return.
     * @returns A new array containing uniformly spaced samples.
     */
    public process(min: number, max: number, numberOfPoints: number) {
        // Sanity checks
        if (numberOfPoints <= 0) {
            this.result.clear();
            return this.result;
        }

        // Clamp and normalize range
        const length = this.values.length; // kommt aus AttributeBuffer
        const start = Math.max(0, Math.min(min, max));
        const end   = Math.min(length - 1, Math.max(min, max));

        if (end <= start) {
            this.result.clear();
            return this.result;
        }

        this.result.ensureCapacity(numberOfPoints);
        this.result.clear();

        // Sonderfall: nur ein Punkt → nimm Mitte des Bereichs
        if (numberOfPoints === 1) {
        const midIndex = Math.round((start + end) * 0.5);
        const v = this.values.getComponentAt(midIndex, 0);
        this.result.push(v);
        return this.result;
        }

        const range = end - start;
        const step = range / (numberOfPoints - 1);

        for (let i = 0; i < numberOfPoints; i++) {
        let idx = start + i * step;
        // auf Integer‑Index runden
        idx = Math.round(idx);
        // sicherheitshalber clampen
        if (idx < start) idx = start;
        if (idx > end) idx = end;

        const value = this.values.getComponentAt(idx, 0);
        this.result.push(value);
        }

        return this.result;
    }

}
