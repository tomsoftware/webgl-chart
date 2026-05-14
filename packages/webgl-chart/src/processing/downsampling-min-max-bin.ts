import { GpuFixBuffer, GpuReadableBuffer } from "@tomsoftware/webgl-lib";

/**
 * DownsamplingMinMaxBin computes per‑bin minimum and maximum values
 * for a given input buffer. This is a classic LOD (Level of Detail)
 * reduction technique used for rendering large datasets efficiently.
 *
 * For each bin (typically one bin per horizontal pixel), the algorithm
 * scans the corresponding range of indices in the source buffer and
 * extracts:
 *   - the minimum value in that bin
 *   - the maximum value in that bin
 *
 * The result is two GPU‑resident buffers (minValues and maxValues)
 * that can be rendered as vertical min/max bars or used as input
 * for further GPU processing.
 *
 * This class does not compute the bin boundaries itself. Instead,
 * it expects a buffer of bin descriptors (usually produced by a
 * UniformSampler or similar X‑downsampler).
 */
export class DownsamplingMinMaxBin {
    public readonly minValues = new GpuFixBuffer('float32', 100);
    public readonly maxValues = new GpuFixBuffer('float32', 100);
    private readonly values: GpuReadableBuffer;

    /**
     * Creates a new Min/Max downsampler.
     * @param values The source buffer containing the full dataset.
     */
    public constructor(values: GpuReadableBuffer) {
        this.values = values;
    }

    /**
     * Computes the min/max values for each bin.
     *
     * @param bins A GPU buffer describing the bin boundaries.
     *             Each entry typically contains the start and end
     *             index of the bin in the source data.
     *
     * @returns An object containing two GPU buffers:
     *          - min: buffer of per‑bin minimum values
     *          - max: buffer of per‑bin maximum values
     *
     * The caller can upload these buffers to the GPU for rendering
     * or further processing.
     */
    public process(bins: GpuReadableBuffer) {
       const binCount = bins.count;

        this.minValues.ensureCapacity(binCount);
        this.maxValues.ensureCapacity(binCount);

        this.minValues.clear();
        this.maxValues.clear();

        for (let i = 0; i < binCount; i++) {
            // Bin-Definition lesen: [startIndex, endIndex]
            const start = bins.getComponentAt(i, 0);
            const end   = bins.getComponentAt(i, 1);

            // Ungültige Bins überspringen
            if (start > end) {
                this.minValues.push(Number.POSITIVE_INFINITY);
                this.maxValues.push(Number.NEGATIVE_INFINITY);
                continue;
            }

            let min = Number.POSITIVE_INFINITY;
            let max = Number.NEGATIVE_INFINITY;

            // Bereich clampen
            const s = Math.max(0, start);
            const e = Math.min(this.values.count - 1, end);

            for (let idx = s; idx <= e; idx++) {
                const v = this.values.getComponentAt(idx, 0);
                if (v < min) min = v;
                if (v > max) max = v;
            }

            this.minValues.push(min);
            this.maxValues.push(max);
        }

        return { min: this.minValues, max: this.maxValues };
    }
}
