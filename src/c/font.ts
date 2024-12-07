import { Color } from "./color";

export class Font {
    private readonly fontName: string;
    private readonly fontSize: number;
    private readonly color: Color;
    private readonly fontSizeType: string;

    public static default = new Font();

    /** return the full font name used as canvas font name */
    public getFont(devicePixelRatio: number = 1): string {
        return (this.fontSize * devicePixelRatio) + this.fontSizeType + ' ' + this.fontName;
    }

    public get fillStyle(): string {
        return this.color.toCss();
    }

    constructor(fontName: string = 'sans-serif', fontSize: number = 10, color: Color = Color.black, fontSizeType: string = 'pt') {
        this.fontName = fontName;
        this.fontSize = fontSize;
        this.fontSizeType = fontSizeType;
        this.color = color;
    }

    /** compare another font with this */
    public compare(other: Font): boolean {
        return this.fontName === other.fontName && this.fontSize === other.fontSize && this.color === other.color;
    }

}
