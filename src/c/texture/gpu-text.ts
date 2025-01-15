import type { Context } from "../context";
import type { IHeightProvider } from "../layout/vertical-item";
import type { TextureGenerator } from "./texture-generator";
import type { IWidthProvider } from "../layout/horizontal-item";
import type { LayoutNode } from "../layout/layout-node";
import { Font } from "./font";
import { GpuTexture } from "./gpu-texture";
import { Matrix3x3 } from "../matrix-3x3";
import { ScreenUnit, ScreenPosition } from "../layout/screen-position";
import { Alignment } from "../alignment";
import { Vector2 } from "../vector-2";
import { Color } from "../color";
import type { Canvas2d } from "../canvas-2d";

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

    public transform(trafo: Matrix3x3): TextBoundingBox {
        const p0 = new Vector2(this.left, this.top).transform(trafo);
        const p1 = new Vector2(this.right, this.bottom).transform(trafo);

        const newBox = new TextBoundingBox();
        newBox.left = Math.min(p0.x, p1.x);
        newBox.top = Math.min(p0.y, p1.y);
        newBox.right = Math.max(p0.x, p1.x);
        newBox.bottom = Math.max(p0.y, p1.y);

        return newBox;
    }
}

export class GpuText implements TextureGenerator, IHeightProvider, IWidthProvider {
    private font: Font;
    private text: string;
    private textMetrics: TextBoundingBox | null = null;
    private rotationDeg: number = 0;
    public color: Color;

    constructor(text: string, alignment?: Alignment, font?: Font, color?: Color) {
        this.text = text;
        this.font = font ?? Font.default;
        this.color = color ?? Color.black;
    }
    
    public setColor(color: Color): GpuText {
        this.color = color;
        return this;
    }

    public setFont(font: Font): GpuText {
        this.font = font;
        return this;
    }

    public getFont(): Font {
        return this.font;
    }

    public setRotation(deg: number): GpuText {
        this.rotationDeg = deg;
        return this;
    }


    public get textureKey() {
        return 't|' + this.font.key + '|' + this.text;
    }

    public compare(other: GpuText): boolean {
        return this.text === other.text && this.font.compare(other.font);
    }

    /** returns the width and height of of text with transformation e.g. rotation */
    public getBoundingBox(context: Context): TextBoundingBox {
        return (this.textMetrics ?? this.computerTextMetrics(context))
            .transform(Matrix3x3.rotateDeg(this.rotationDeg));
    }

    public getWidth(context: Context): ScreenPosition {
        const size = this.getBoundingBox(context);

        return new ScreenPosition(
            size.width,
            ScreenUnit.Pixel
        );
    }

    public getHeight(context: Context): ScreenPosition {
        const size = this.getBoundingBox(context);

        return new ScreenPosition(
            size.height,
            ScreenUnit.Pixel
        );
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
        console.log('computerSize:', this.text);

        if (this.text == '') {
            return this.textMetrics = new TextBoundingBox();
        }

        const ctx = this.setupCanvas(context);
        return this.textMetrics = new TextBoundingBox(ctx.measureText(this.text));
    }

    public computerTexture(context: Context): GpuTexture | null {
        console.log('computerTexture:', this.text);

        if (this.text == '') {
            return new GpuTexture(0, 0, new Uint32Array(0));
        }

        const ctx = this.setupCanvas(context);

        let textMetrics = this.textMetrics;
        if (textMetrics == null) {
            textMetrics = new TextBoundingBox(ctx.measureText(this.text));
            this.textMetrics = textMetrics;
        }

        ctx.clearRect(0, 0, textMetrics.right + 2, textMetrics.height + 2);
        // text is drawn from bottom to up at baseline
        ctx.fillText(this.text, 0, textMetrics.bottom);

        const data = ctx.getImageData(textMetrics.left, 0, textMetrics.width + 1, textMetrics.height + 1);
        return GpuTexture.fromImageData(data);
    }

    public draw(context: Context, layout: LayoutNode, alignment: Alignment | null = null, trafo: Matrix3x3 | null = null) {
        const state = context.addTexture(this);
        if (state == null) {
            // unable to generate texture
            return;
        }
        const area = layout.getArea(context.layoutCache);

        let m = area.getAligned(alignment);

        if (this.rotationDeg !== 0) {
            m = m.multiply(new Matrix3x3().rotateDeg(this.rotationDeg).values);
        }

        if (trafo != null) {
            m = m.multiply(trafo.values);
        }
        context.drawTexture(state, m, this.color);
    }
}
