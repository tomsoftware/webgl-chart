import type { Context } from "../context";
import type { GpuTexture } from "./gpu-texture";
import type { TextureGenerator } from "./texture-generator";
import { TextureMapItem } from "./texture-map-item";
import type { IUniformValue } from "../uniform";

class TextureSlot {
    // current fill state of the slot
    private currentX: number = 0;
    // y pos of the slot
    private y: number;
    // max length of the slot
    private width: number;
    // height of the slot
    private height: number;
    // height of the slot
    private minHeight: number;

    constructor(y: number, width: number, height: number, minHeight: number) {
        this.y = y;
        this.width = width;
        this.height = height;
        this.minHeight = minHeight;
    }

    public checkSpace(w: number, h: number) {
        if (h > this.height) {
            // the slot is to small
            return false;
        }
        if (h < this.minHeight) {
            // do not accept textures that are to small
            return false;
        }

        if (this.currentX + w > this.width) {
            // the slot is full
            return false;
        }

        return true;
    }

    public allocateSlot(w: number) {
        const x = this.currentX;
        this.currentX += w;
        return {
            x,
            y: this.y
        };
    }
}

/** Handles a Texture map in that many small textures can be saved */
export class TextureMap implements IUniformValue {
    private textures = new Map<string, TextureMapItem>();
    private buffer: Uint32Array;
    private width = 2 << 7; // 2^8 = 256
    private height = this.width; // quadratic texture
    public gpuTextureIsDirty: boolean = false;
    private textureId: WebGLTexture | null = null;
    private slots: TextureSlot[] = [];
    private nextFreeSlotPosY = 18;

    constructor() {
        this.buffer = new Uint32Array(this.width * this.height);
        this.fillBuffer(0x00);
    }

    /** find a free space in the texture map */
    private findFreeSlot(w: number, h: number) {
        const freeSlot = this.slots.find((slot) => slot.checkSpace(w, h));
        if (freeSlot != null) {
            return freeSlot.allocateSlot(w);
        }

        const newSlotH = Math.ceil(h / 5) * 5;
        const newSlot = new TextureSlot(this.nextFreeSlotPosY, this.width, newSlotH, newSlotH - 5);
        this.slots.push(newSlot);
        this.nextFreeSlotPosY += newSlotH;

        return newSlot.allocateSlot(w);
    }

    /** draw a texture from the  */
    public bind(context: Context): WebGLTexture | null {
        const gl = context.gl;

        if (this.textureId == null) {
            console.log('Texture-map: creating new texture!');
            this.textureId = context.gl.createTexture();
        }

        gl.bindTexture(gl.TEXTURE_2D, this.textureId);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        if (this.gpuTextureIsDirty) {
            this.updateTexture(gl);
            this.gpuTextureIsDirty = false;
        }

        /// enable alpha blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

       return this.textureId;
    }

    private fillBuffer(color: number) {
        for (let i = 0; i < this.buffer.length; i++) {
            this.buffer[i] = color;
        }
    }

    /** write the texture-image to the GPU */
    private updateTexture(gl: WebGLRenderingContext) {
        console.log('TextureMap: update texture');
        gl.texImage2D(
            WebGLRenderingContext.TEXTURE_2D,
            0,
            WebGLRenderingContext.RGBA,
            this.width,
            this.height,
            0,
            WebGLRenderingContext.RGBA,
            WebGLRenderingContext.UNSIGNED_BYTE,
            new Uint8Array(this.buffer.buffer));

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    public addTexture(context: Context, texture: TextureGenerator): TextureMapItem | null {
        const textureKey = texture.textureKey;
        const item = this.textures.get(textureKey);
        if (item != null) {
            return item;
        }

        // generate the texture
        const textData = texture.computerTexture(context);
        if (textData == null) {
            return null;
        }

        // find free space in the texture map
        const textureWidth = textData.width + 1;
        const textureHeight = textData.height + 2;
        const slot = this.findFreeSlot(textureWidth, textureHeight);

        // copy the texture to the texture map
        this.copyTexture(textData, slot.x + 1, slot.y + 1);
        this.gpuTextureIsDirty = true;

        // create a new texture map item
        const newItem = new TextureMapItem(slot.x + 1, slot.y + 1, textData.width, textData.height, this.width, this.height);
        this.textures.set(textureKey, newItem);

        return newItem;
    }

    private copyTexture(texture: GpuTexture, x: number, y: number) {
        const data = texture.data;
        const width = texture.width;
        const height = texture.height;
        const buffer = this.buffer;
        const bufferWidth = this.width;

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                buffer[(y + i) * bufferWidth + x + j] = /* 0xff0000ff; */ data[i * width + j];
            }
        }
    }

    public dispose(gl: WebGLRenderingContext) {
        gl.deleteTexture(this.textureId);
    }

    public bindUniform(gl: WebGLRenderingContext, variableLoc: WebGLUniformLocation): void {
        gl.uniform1i(variableLoc, 0);
    }

    /** Return a html <image> of the texture buffer - mainly for debugging purposes */
    public exportToHtmlImage(): HTMLImageElement | null {
        if (typeof document === 'undefined') {
            return null;
        }

        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
    
        if (ctx) {
            const imageData = ctx.createImageData(this.width, this.height);
            const uint8Buffer = new Uint8ClampedArray(this.buffer.buffer);
            imageData.data.set(uint8Buffer);
            ctx.putImageData(imageData, 0, 0);
        }
    
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

}
