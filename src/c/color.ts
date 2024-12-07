export class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;

    constructor(r: number, g: number, b: number, a: number = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    public toArray(): number[] {
        return [this.r, this.g, this.b, this.a];
    }

    private static toByte(value: number): number {
        return Math.min(255, Math.max(0, Math.round(value * 255)));
    }

    private static toHexValue(value: number): string {
        const v = Math.min(255, Math.max(0, Math.round(value * 255)));
        const s = v.toString(16);
        if (s.length === 1) {
            return '0' + s;
        }
        return s;
    }

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

    public static fromHex(color: number) {
        return new Color(
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff,
            1
        );
    }

    public static fromBytes(r: number, g: number, b: number, a: number = 255) {
        return new Color(
            r / 255,
            g / 255,
            b / 255,
            a / 255
        );
    }

    public static red = new Color(1, 0, 0, 1);
    public static blue = new Color(0, 0, 1, 1);
    public static green = new Color(0, 1, 0, 1);
    public static yellow = new Color(1, 1, 0, 1);
    public static black = new Color(0, 0, 0, 1);
    public static white = new Color(1, 1, 1, 1);
    public static cyan = new Color(0, 1, 1, 1);
    public static magenta = new Color(1, 0, 1, 1);
    public static orange = new Color(1, 0.5, 0, 1);
    public static purple = new Color(0.5, 0, 0.5, 1);
    public static brown = new Color(0.6, 0.3, 0, 1);
    public static gray = new Color(0.5, 0.5, 0.5, 1);
    public static lightGray = new Color(0.827, 0.827, 0.827, 1);

    public static colorList = [
        Color.fromBytes(54, 162, 235), // blue
        Color.fromBytes(255, 99, 132), // red
        Color.fromBytes(255, 159, 64), // orange
        Color.fromBytes(255, 205, 86), // yellow
        Color.fromBytes(75, 192, 192), // green
        Color.fromBytes(153, 102, 255), // purple
        Color.fromBytes(201, 203, 207)  // grey
    ];

    /** return a color for a given index/number */
    public static byIndex(i: number) {
        return Color.colorList[i % Color.colorList.length];
    }
}
