/** Defines Colors and methods to convert or change them */
export class Color {
    public readonly r: number;
    public readonly g: number;
    public readonly b: number;
    public readonly a: number;

    constructor(r: number, g: number, b: number, a: number = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    /** return this color as array [r, g, b] */
    public toArray(): number[] {
        return [this.r, this.g, this.b, this.a];
    }

    /** create a new color with replaced alpha value */
    public withAlpha(a: number): Color {
        return new Color(this.r, this.g, this.b, a)
    }

    private static toByte(value: number): number {
        return Math.min(255, Math.max(0, Math.round(value * 255)));
    }

    /** returns this color as hex value string: e.g. 'ff00aa' */
    private static toHexValue(value: number): string {
        const v = Math.min(255, Math.max(0, Math.round(value * 255)));
        const s = v.toString(16);
        if (s.length === 1) {
            return '0' + s;
        }
        return s;
    }

    /** returns this color as css string: e.g. rgb(255, 0, 0) */
    public toCss(): string {
        const r = Color.toByte(this.r);
        const g = Color.toByte(this.g);
        const b = Color.toByte(this.b);
        return 'rgb(' + r + ' ' + g + ' ' + b +' /' + this.a + ')';
    }

    public toHexString(): string {
        const r = Color.toHexValue(this.r);
        const g = Color.toHexValue(this.g);
        const b = Color.toHexValue(this.b);
        return r + g + b;
    }

    /** create a color from a int value e.g.: color.fromHex(0xff00ff) */
    public static fromHex(color: number) {
        return this.fromBytes(
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff
        );
    }

    /** create a color from byte values e.g.: color.fromBytes(0, 255, 0) */
    public static fromBytes(r: number, g: number, b: number, a: number = 255) {
        return new Color(
            r / 255,
            g / 255,
            b / 255,
            a / 255
        );
    }

    /** create a color from float array */
    static fromFloatArray(values: Float32Array): Color {
        return new Color(values[0], values[1], values[2], values[3]);
    }

    // returns a gray color from a given byte 0=black to 255=white
    public static grayFromBytes(v: number, a = 1) {
        return new Color(v / 255, v / 255, v / 255, a);
    }

    public static red = new Color(1, 0, 0, 1);
    public static lightRed = new Color(1, 0.28, 0.3, 1);
    public static blue = new Color(0, 0, 1, 1);
    public static darkBlue = new Color(0, 0, 0.55, 1);
    public static lightBlue = new Color(0.6, 0.8, 1, 1);
    public static green = new Color(0, 1, 0, 1);
    public static darkGreen = new Color(0, 0.39, 0, 1);
    public static yellow = new Color(1, 1, 0);
    public static black = new Color(0, 0, 0, 1);
    public static white = new Color(1, 1, 1, 1);
    public static cyan = new Color(0, 1, 1, 1);
    public static magenta = new Color(1, 0, 1);
    public static orange = new Color(1, 0.5, 0, 1);
    public static purple = new Color(0.5, 0, 0.5, 1);
    public static brown = new Color(0.6, 0.3, 0, 1);
    public static gray = Color.grayFromBytes(190);
    public static lightGray = Color.grayFromBytes(211);
    public static darkGray = Color.grayFromBytes(169);
    public static whiteSmoke = Color.grayFromBytes(245);
    public static platinum = Color.fromBytes(229, 228, 226)

    /** common color list */
    public static colorList = [
        Color.fromBytes(54, 162, 235), // blue
        Color.fromBytes(255, 99, 132), // red
        Color.fromBytes(255, 205, 86), // yellow
        Color.fromBytes(255, 159, 64), // orange
        Color.fromBytes(75, 192, 192), // green
        Color.fromBytes(153, 102, 255), // purple
        Color.fromBytes(201, 203, 207)  // grey
    ];

    /** return a color for a given index/number from the common color list */
    public static byIndex(i: number) {
        return Color.colorList[i % Color.colorList.length];
    }
}
