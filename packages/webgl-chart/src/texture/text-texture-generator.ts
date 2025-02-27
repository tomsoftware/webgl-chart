import type { Context } from "../context";
import type { TextureGenerator } from "./texture-generator";
import { TextBoundingBox } from "./text-bounding-box";
import { Font } from "./font";
import { GpuTexture } from "./gpu-texture";

export class TextTextureGenerator implements TextureGenerator {
    private static cache: Map<string, TextTextureGenerator> = new Map();
    public readonly font: Font;
    public readonly text: string;
    private textMetricsCache: TextBoundingBox | null = null;

    constructor(text: string, font: Font) {
        this.text = text;
        this.font = font;
    }

    /** return a instance of TextTextureGenerator but used cached on if available */
    public static getCached(text: string, font: Font): TextTextureGenerator {
        const key = 't|' + font.key + '|' + text;

        const item = this.cache.get(key);
        if (item) {
            return item;
        }

        const newItem = new TextTextureGenerator(text, font);
        this.cache.set(key, newItem);
        return newItem;
    }

    public get textureKey() {
        return 't|' + this.font.key + '|' + this.text;
    }

    public compare(other: TextTextureGenerator): boolean {
        return this.text === other.text && this.font.compare(other.font);
    }

    private setupCanvas(context: Context): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D {
        const canvas = context.canvas2d;

        const ctx = canvas.getContext2d();
        if (ctx == null) {
            throw new Error('unable to get 2d context');
        }

        ctx.font = this.font.getCssFont(canvas.devicePixelRatio);
        // we always use white so we can multiply the real font color in the fragment shader
        ctx.fillStyle = 'white';

        return ctx;
    }

    public computerTextMetrics(context: Context): TextBoundingBox {
        if (this.textMetricsCache != null) {
            return this.textMetricsCache;
        }

        console.log('computerSize:', this.text);

        if (this.text == '') {
            return this.textMetricsCache = new TextBoundingBox();
        }

        const ctx = this.setupCanvas(context);
        return this.textMetricsCache = new TextBoundingBox(ctx.measureText(this.text));
    }

    public computerTexture(context: Context): GpuTexture | null {
        console.log('computerTexture:', this.text);

        if (this.text == '') {
            return new GpuTexture(0, 0, new Uint32Array(0));
        }

        const ctx = this.setupCanvas(context);

        let textMetrics = this.textMetricsCache;
        if (textMetrics == null) {
            textMetrics = new TextBoundingBox(ctx.measureText(this.text));
            this.textMetricsCache = textMetrics;
        }

        ctx.clearRect(0, 0, textMetrics.right + 2, textMetrics.height + 2);
        // text is drawn from bottom to up at baseline
        ctx.fillText(this.text, 0, textMetrics.bottom);

        const data = ctx.getImageData(textMetrics.left, 0, textMetrics.width + 1, textMetrics.height + 1);
        return GpuTexture.fromImageData(data);
    }

}
