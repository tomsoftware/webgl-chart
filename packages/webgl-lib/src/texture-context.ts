import { TextureMap } from './texture/texture-map';
import { TextureMapItem } from './texture/texture-map-item';
import { Canvas2d } from './canvas-2d';
import type { TextureGenerator } from './texture/texture-generator';
import { TextureMapDrawer } from './texture/gpu-texture-map-drawer';
import { Context } from './context';
import { Matrix3x3 } from './matrix-3x3';
import { Color } from './color';

export class TextureContext {
    private offscreenCanvas2d: Canvas2d;
    private textureDrawer = new TextureMapDrawer(new TextureMap());

    public constructor(devicePixelRatio: number = 1) {
        this.offscreenCanvas2d = new Canvas2d(300, 100, devicePixelRatio);
    }

    public init(devicePixelRatio: number) {
        this.canvas2d.devicePixelRatio = devicePixelRatio;
    }
     
    /** 
     * provides a offscreen canvas context in 2d that can be used
     *  for temporal generating of textures
     **/
    public get canvas2d() {
        return this.offscreenCanvas2d;
    }


    public addTexture(src: TextureGenerator): TextureMapItem | null {
        if (src == null) {
            return null;
        }

        return this.textureDrawer.addTexture(this, src);
    }

    public dispose(gl: WebGLRenderingContext) {
        this.textureDrawer.dispose(gl);
    }

    public drawTexture(textureInfo: TextureMapItem, transformation: Matrix3x3, color: Color) {
        this.textureDrawer.add(transformation, textureInfo, color);
    }


    public clear() {
        this.textureDrawer.clear();
    }

    /**
     * Return a html of the texture buffer used by the texture map
     * - mainly for debugging purposes 
     **/
    public exportTextureHtmlImage() {
        return this.textureDrawer.exportToHtmlImage();
    }

    public flushTextures(context: Context, transformation: Matrix3x3) {
        this.textureDrawer.draw(context, transformation);
        this.textureDrawer.clear();
    }
}
