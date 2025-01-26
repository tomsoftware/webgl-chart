import type { Context } from "../context";
import type { IHeightProvider } from "../layout/vertical-item";
import type { IWidthProvider } from "../layout/horizontal-item";
import type { LayoutNode } from "../layout/layout-node";
import type { TextBoundingBox } from "./text-bounding-box";
import { Font } from "./font";
import { Matrix3x3 } from "../matrix-3x3";
import { ScreenUnit, ScreenPosition } from "../layout/screen-position";
import { Alignment } from "../alignment";
import { Color } from "../color";
import { TextTextureGenerator } from "./text-texture-generator";


export class GpuText implements IHeightProvider, IWidthProvider {
    private generator: TextTextureGenerator;
    private rotationDeg: number = 0;
    public color: Color;

    constructor(text: string, font?: Font, color?: Color) {
        this.generator = TextTextureGenerator.getCached(text, font ?? Font.default);
        this.color = color ?? Color.black;
    }
    
    public setColor(color: Color): GpuText {
        this.color = color;
        return this;
    }

    public getText(): string {
        return this.generator.text;
    }

    public setText(text: string): GpuText {
        this.generator = TextTextureGenerator.getCached(text, this.getFont());
        return this;
    }

    public getFont(): Font {
        return this.generator.font;
    }

    public setFont(font: Font): GpuText {
        this.generator = TextTextureGenerator.getCached(this.getText(), font);
        return this;
    }

    public setRotation(deg: number): GpuText {
        this.rotationDeg = deg;
        return this;
    }

    public compare(other: GpuText): boolean {
        return this.generator.compare(other.generator);
    }

    public getGenerator() {
        return this.generator;
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
        return this.generator
            .computerTextMetrics(context)
            .transform(Matrix3x3.rotateDeg(this.rotationDeg));
    }

    public draw(context: Context, layout: LayoutNode, alignment: Alignment | null = null, transformation: Matrix3x3 | null = null) {
        const state = context.addTexture(this.generator);
        if (state == null) {
            // unable to generate texture
            return;
        }
        const area = layout.getArea(context.layoutCache);

        let m = area.getAligned(alignment);

        if (this.rotationDeg !== 0) {
            m = m.multiply(new Matrix3x3().rotateDeg(this.rotationDeg).values);
        }

        if (transformation != null) {
            m = m.multiply(transformation.values);
        }
    
        context.drawTexture(state, m, this.color);
    }
}
