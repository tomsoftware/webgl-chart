import type { Context } from "../context";
import type { IHeightProvider } from "../layout/vertical-item";
import type { IWidthProvider } from "../layout/horizontal-item";
import type { LayoutNode } from "../layout/layout-node";
import { TextBoundingBox } from "./text-bounding-box";
import { Font } from "./font";
import { Matrix3x3 } from "../matrix-3x3";
import { ScreenUnit, ScreenPosition } from "../layout/screen-position";
import { Alignment } from "../alignment";
import { Color } from "../color";
import { TextTextureGenerator } from "./text-texture-generator";


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

    /** returns the width and height of of text with transformation e.g. rotation */
    public getBoundingBox(context: Context): TextBoundingBox {
        if (this.textMetricsCache != null) {
            return this.textMetricsCache;
        }
        // calculate new
        const size = new TextBoundingBox();

        for(const g of this.generators) {
            const m = g.computerTextMetrics(context)
            size.increaseWidth(m.width);
        }
        this.textMetricsCache = size.transform(Matrix3x3.rotateDeg(this.rotationDeg));
        return this.textMetricsCache;
    }

    public draw(context: Context, layout: LayoutNode, alignment: Alignment | null = null, transformation: Matrix3x3 | null = null) {

        const area = layout.getArea(context.layoutCache);

        let m = area.getAligned(alignment);

        if (this.rotationDeg !== 0) {
            m = m.multiply(new Matrix3x3().rotateDeg(this.rotationDeg).values);
        }

        if (transformation != null) {
            m = m.multiply(transformation.values);
        }
        
        const fullSize = this.getBoundingBox(context);
        m = m.translate(-(fullSize.width / 2) / context.width, 2 / context.width);

        let posX = 0;
        for (const g of this.generators) {
            const state = context.addTexture(g);
            if (state == null) {
                continue;
            }
            const metric = g.computerTextMetrics(context);
            const p = m.translate((posX + state.width / 2) / context.width, -metric.bottom / 2 / context.width);
            posX += metric.width;

            context.drawTexture(state, p, this.color);
        }


    }
}
