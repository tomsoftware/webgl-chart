import type { Context } from "../context";

export enum ScreenUnit {
    // value is in the range [0, 1]
    Normalized = 1,
    // value is in pixels
    Pixel = 0
}

export class ScreenPosition {
    public readonly value: number;
    public readonly unit: ScreenUnit;

    public constructor(value: number, unit: ScreenUnit) {
        this.value = value;
        this.unit = unit;
    }

    /** convert the ScreenPosition to a Normalized position */
    public toNormalized(context: Context): number {
        if (this.unit === ScreenUnit.Normalized) {
            return this.value;
        } else {
            return this.value / context.width;
        }
    }

    /** convert the ScreenPosition to a pixel position */
    public toPixel(context: Context): number {
        if (this.unit === ScreenUnit.Pixel) {
            return this.value;
        } else {
            return this.value * context.width;
        }
    }

    public static FromPixel(value: number): ScreenPosition {
        return new ScreenPosition(value, ScreenUnit.Pixel);
    }

    public static FromNormalized(value: number): ScreenPosition {
        return new ScreenPosition(value, ScreenUnit.Normalized);
    }
}
