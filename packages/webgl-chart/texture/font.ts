export class Font {
    private readonly fontName: string;
    private readonly fontSize: number;
    private readonly fontSizeType: string;

    public static default = new Font();

    /** return the full font name used as canvas font name */
    public getCssFont(devicePixelRatio: number = 1): string {
        return (this.fontSize * devicePixelRatio) + this.fontSizeType + ' ' + this.fontName;
    }

    public get key() {
        return this.fontName + '|' + this.fontSize;
    }

    constructor(fontName: string = 'sans-serif', fontSize: number = 10, fontSizeType: string = 'pt') {
        this.fontName = fontName;
        this.fontSize = fontSize;
        this.fontSizeType = fontSizeType;
    }

    /** compare another font with this */
    public compare(other: Font): boolean {
        return this.fontName === other.fontName && this.fontSize === other.fontSize;
    }

}
