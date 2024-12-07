import type { Context } from "./context";
import { Font } from "./font";
import { GpuTexture } from "./gpu-texture";
import type { IHeightProvider } from "./layout/vertical-item";
import { Matrix3x3 } from "./matrix-3x3";
import type { TextureGenerator } from "./texture-generator";
import type { IWidthProvider } from "./layout/horizontal-item";
import { ScreenUnit, ScreenPosition } from "./layout/screen-position";
import type { LayoutNode } from "./layout/layout-node";

class TextBoundingBox {
    public left: number;
    public right: number;
    public top: number;
    public bottom: number;

    public get width() {
        return this.right - this.left;
    }
    public get height() {
        return this.bottom + this.top;
    }

    public constructor(textMetrics?: TextMetrics) {
        if (textMetrics == null) {
            this.left = 0;
            this.right = 0;
            this.top = 0;
            this.bottom = 0;
        } else {
            this.left = textMetrics.actualBoundingBoxLeft;
            this.right = textMetrics.actualBoundingBoxRight;
            this.top = textMetrics.actualBoundingBoxDescent;
            this.bottom = textMetrics.actualBoundingBoxAscent;
        }
    }
}

export class GpuText implements TextureGenerator, IHeightProvider, IWidthProvider {
    private font: Font;
    private text: string;
    private textMetrics: TextBoundingBox | null = null;

    constructor(text: string, font?: Font) {
        this.text = text;
        this.font = font ?? Font.default;
    }

    public compare(other: GpuText): boolean {
        return this.text === other.text && this.font.compare(other.font);
    }

    public getWidth(context: Context): ScreenPosition {
        return new ScreenPosition(
            this.textMetrics?.width ?? this.computerTextMetrics(context).width,
            ScreenUnit.Pixel
        );
    }

    public getHeight(context: Context): ScreenPosition {
        return new ScreenPosition(
            this.textMetrics?.height ?? this.computerTextMetrics(context).height,
            ScreenUnit.Pixel
        );
    }

    public computerTextMetrics(context: Context): TextBoundingBox {
        const canvas = context.canvas2d;

        console.log('computerSize:', this.text);

        if (this.text == '') {
            return this.textMetrics = new TextBoundingBox();
        }

        const ctx = canvas.getContext2d();
        if (ctx == null) {
            throw new Error('unable to get 2d context');
        }

        ctx.font = this.font.getFont(canvas.devicePixelRatio);
        ctx.fillStyle = this.font.fillStyle;

        return this.textMetrics = new TextBoundingBox(ctx.measureText(this.text));
    }

    public computerTexture(context: Context): GpuTexture | null {
        const canvas = context.canvas2d;

        console.log('computerTexture:', this.text);

        if (this.text == '') {
            return new GpuTexture(0, 0, new Uint32Array(0));
        }

        const ctx = canvas.getContext2d();
        if (ctx == null) {
            return null;
        }

        ctx.font = this.font.getFont(canvas.devicePixelRatio);
        ctx.fillStyle = this.font.fillStyle;

        let textMetrics = this.textMetrics;
        if (textMetrics == null) {
            textMetrics = new TextBoundingBox(ctx.measureText(this.text));
            this.textMetrics = textMetrics;
        }

        ctx.clearRect(0, 0, textMetrics.right, textMetrics.height);
        // text is drawn from bottom to up at baseline
        ctx.fillText(this.text, 0, textMetrics.bottom);

        const data = ctx.getImageData(textMetrics.left, 0, textMetrics.width, textMetrics.height);
        return GpuTexture.fromImageData(data);
    }

    public draw(context: Context, layout: LayoutNode, trafo: Matrix3x3) {
        const state = context.addTexture(this);
        if (state == null) {
            // unable to generate texture
            return;
        }
        const area = layout.getArea(context.layoutCache);

        context.drawTexture(state, area.toMaxtrix().multiply(trafo.values));
    }
}
