import type { Context } from "../context";
import type { LayoutNode } from "../layout/layout-node";
import { TextBoundingBox } from "./text-bounding-box";
import { Font } from "./font";
import { Matrix3x3 } from "../matrix-3x3";
import { ScreenUnit, ScreenPosition } from "../layout/screen-position";
import { Alignment } from "../alignment";
import { Color } from "../color";
import { TextTextureGenerator } from "./text-texture-generator";
import { IHeightProvider, IWidthProvider } from "../layout/size-provider";
import { Vector2 } from "../vector-2";


export class GpuLetterText implements IHeightProvider, IWidthProvider {
    private generators: TextTextureGenerator[] = [];
    private text: string;
    private font: Font;
    private rotationDeg: number = 0;
    private textMetricsCache: TextBoundingBox | null = null;
    public color: Color;

    constructor(text: string, font?: Font, color?: Color) {
        this.text = text;
        this.font = font ?? Font.default;
        this.generators = this.buildGenerators();
        this.color = color ?? Color.black;
    }

    private buildGenerators(): TextTextureGenerator[] {
        // reset cached size
        this.textMetricsCache = null;
        // build generators for every letter
        return this.text.split('').map(c => TextTextureGenerator.getCached(c, this.font));
    }

    public setColor(color: Color): GpuLetterText {
        this.color = color;
        return this;
    }

    public getText(): string {
        return this.text;
    }

    public setText(text: string): GpuLetterText {
        this.text = text;
        this.generators = this.buildGenerators();
        return this;
    }

    public getFont(): Font {
        return this.font;
    }

    public setFont(font: Font): GpuLetterText {
        this.font = font;
        this.generators = this.buildGenerators();
        return this;
    }

    public setRotation(deg: number): GpuLetterText {
        this.rotationDeg = deg;
        return this;
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

    /** returns the width and height of of text without transformation */
    public getAxisAlignedBoundingBox(context: Context): TextBoundingBox {
        if (this.textMetricsCache != null) {
            return this.textMetricsCache ;
        }

        // calculate new
        let w = 0;
        let h = 0;
        for(const g of this.generators) {
            const m = g.computerTextMetrics(context);
            h = Math.max(h, m.height);
            w = w + m.width;
        }
        const size = new TextBoundingBox(0, 0, w, h);
        this.textMetricsCache = size;
        return size;
    }

    /** returns the width and height of of text with transformation e.g. rotation */
    public getBoundingBox(context: Context): TextBoundingBox {
        return this.getAxisAlignedBoundingBox(context)
            .transform(Matrix3x3.rotateDeg(this.rotationDeg));
    }

    /** draw a text at a given position */
    public drawAt(context: Context, pos: Vector2, alignment: Alignment = Alignment.centerCenter, padding: Vector2 = Vector2.zero, transformation: Matrix3x3 | null = null) {
        let m = Matrix3x3.translate(pos.x, pos.y);

        if (this.rotationDeg !== 0) {
            m = m.multiply(new Matrix3x3().rotateDeg(this.rotationDeg).values);
        }

        if (transformation != null) {
            m = m.multiply(transformation.values);
        }

        const scaleX = context.pixelScale.x;
        const scaleY = context.pixelScale.y;

        const paddingX =  padding.x * scaleX;
        const paddingY =  padding.y * scaleY;

        const fullSize = this.getBoundingBox(context);
        const w = fullSize.width * scaleX;
        const h = fullSize.height * scaleY;


        // move first letter and add alignment to the position
        m = m.translate(
            -w * 0.5 + (alignment.alignX - 0.5) * (w + paddingX),
             h * 0.5 + (alignment.alignY - 0.5) * (h + paddingY)
        );

        let posX = 0;
        for (const g of this.generators) {
            const state = context.addTexture(g);
            if (state == null) {
                continue;
            }
            const metric = g.computerTextMetrics(context);
            const p = m.translate((posX + state.width / 2) * scaleX, -metric.bottom / 2 * scaleY);
            posX += metric.width;

            context.drawTexture(state, p, this.color);
        }
    }

    /** draw a text into a layout node */
    public draw(context: Context, layout: LayoutNode, alignment: Alignment | null = null, transformation: Matrix3x3 | null = null) {
        // get the area of the layout to draw to
        let area = layout.getArea(context.layoutCache);

        // to make the text to be always in the area we shrink the area by the size of the text
        const rotatedFullSize = this.getBoundingBox(context);
        area = area.adjustMargin(context.pixelToScreenX(rotatedFullSize.width * 0.5), context.pixelToScreenY(rotatedFullSize.height * 0.5));

        // apply alignment
        let m = area.getAligned(alignment);

        // apply additional transformation
        if (transformation != null) {
            m = m.multiply(transformation.values);
        }
        
        // apply rotation
        if (this.rotationDeg !== 0) {
            m = m.multiply(Matrix3x3.rotateDeg(this.rotationDeg).values);
        }

        const alignFullSize = this.getAxisAlignedBoundingBox(context);
        let posX = -alignFullSize.width * 0.5;
        let posY = -alignFullSize.height * 0.5;

        for (const g of this.generators) {
            const state = context.addTexture(g);
            if (state == null) {
                continue;
            }
            // get size of the texture
            const metric = g.computerTextMetrics(context);

            // calc position
            const x = context.pixelToScreenX(posX + state.width * 0.5);
            const y = context.pixelToScreenY(posY + state.height * 0.5);

            let p = m.multiply(Matrix3x3.translate(x, y).values);

            posX += metric.width;

            context.drawTexture(state, p, this.color);
        }
    }
}
