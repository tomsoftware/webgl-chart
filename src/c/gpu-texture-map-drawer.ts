import { Context } from "./context";
import { GpuBuffer } from "./gpu-buffer";
import { Matrix3x3 } from "./matrix-3x3";
import type { TextureGenerator } from "./texture-generator";
import { TextureMap } from "./texture-map";
import { TextureMapItem } from "./texture-map-item";
import { Vector2 } from "./vector-2";

export class TextureMapDrawer {
    private positionLocation = new GpuBuffer(0, 2);
    private texcoordLocation = new GpuBuffer(0, 2);
    private textureMap: TextureMap;

    /** this is a unique id to identyfy the shader programms */
    private static Id = 'gpu-texture-map-drawer';

    public constructor(textureMap: TextureMap) {
        this.textureMap = textureMap;
    }

    public clear() {
        this.positionLocation.clear();
        this.texcoordLocation.clear();
    }

    public add(trafo: Matrix3x3, screenWidth: number, _screenHeight: number, textureInfo: TextureMapItem) {
        const relW = textureInfo.relativeWidth;
        const relH = textureInfo.relativeHeight;


        const w1 = textureInfo.width / 2 / screenWidth;
        const w0 = -w1;
        const h1 = textureInfo.height / 2 / screenWidth;
        const h0 = -h1;

        const p1 = new Vector2(w0, h0).transform(trafo);
        const p2 = new Vector2(w1, h1).transform(trafo);
        const p3 = new Vector2(w1, h0).transform(trafo);
        const p4 = new Vector2(w0, h1).transform(trafo);

        // switch y axis to not get text upside down
        const t1 = new Vector2(textureInfo.relativeX, textureInfo.relativeY);
        const t2 = new Vector2(textureInfo.relativeX + relW, textureInfo.relativeY + relH);
        const t3 = new Vector2(textureInfo.relativeX + relW, textureInfo.relativeY);
        const t4 = new Vector2(textureInfo.relativeX, textureInfo.relativeY + relH);

        // first triangle
        this.positionLocation.pushRange(p1.values);
        this.positionLocation.pushRange(p2.values);
        this.positionLocation.pushRange(p3.values);

        this.texcoordLocation.pushRange(t1.values);
        this.texcoordLocation.pushRange(t2.values);
        this.texcoordLocation.pushRange(t3.values);

        // second triangle
        this.positionLocation.pushRange(p1.values);
        this.positionLocation.pushRange(p2.values);
        this.positionLocation.pushRange(p4.values);

        this.texcoordLocation.pushRange(t1.values);
        this.texcoordLocation.pushRange(t2.values);
        this.texcoordLocation.pushRange(t4.values);
    }

    public addTexture(context: Context, src: TextureGenerator) {
        return this.textureMap.addTexture(context, src);
    }

    public dispose(gl: WebGLRenderingContext) {
        this.textureMap.dispose(gl);
    }

    private static vertexShader = `
        attribute vec2 position;
        attribute vec2 texcoord;

        uniform mat3 uniformTrafo;

        varying vec2 v_texcoord;

        void main() {
            // Multiply the position by the matrix.
            gl_Position = vec4((uniformTrafo * vec3(position.xy, 1)).xy, 0, 1);

            // Pass the texcoord to the fragment shader.
            v_texcoord = texcoord;
        }
        `;

    private static fragmentShader = `
        precision mediump float;

        // Passed in from the vertex shader.
        varying vec2 v_texcoord;

        // The texture.
        uniform sampler2D u_texture;

        void main() {
            gl_FragColor = texture2D(u_texture, v_texcoord);
            // gl_FragColor = vec4(1,0,0,1);
        }
        `;

    /** draw a texture from the  */
    public draw(context: Context, trafo: Matrix3x3) {
        const textureId = this.textureMap.bind(context);
        if (textureId == null) {
            console.error('TextureMapDrawer.draw: Unable to bind texture!');
            return;
        }

        // create and use shader program
        const program = context.useProgram(TextureMapDrawer.Id, TextureMapDrawer.vertexShader, TextureMapDrawer.fragmentShader);

        // bind data buffer to attribute
        context.setBuffer(program, 'position', this.positionLocation);
        context.setBuffer(program, 'texcoord', this.texcoordLocation);

        // set uniforms
        context.setUniform(program, 'uniformTrafo', trafo);
        context.setUniform(program, 'u_texture', this.textureMap);

        // draw buffer / series data
        const offset = 0;
        context.gl.drawArrays(WebGLRenderingContext.TRIANGLES, offset, this.positionLocation.count);
    }
}