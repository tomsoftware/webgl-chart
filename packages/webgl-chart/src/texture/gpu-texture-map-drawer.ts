import type { TextureGenerator } from "./texture-generator";
import { Context } from "../context";
import { GpuFloatBuffer } from "../buffers/gpu-buffer-float";
import { Matrix3x3 } from "../matrix-3x3";
import { TextureMap } from "./texture-map";
import { TextureMapItem } from "./texture-map-item";
import { Color } from "../color";
import { GpuShortBuffer } from "../buffers/gpu-buffer-short";
import { Vector2 } from "../vector-2";
import { GpuBufferMatrix3x3 } from "../buffers/gpu-buffer-matrix-3x3";

export class TextureMapDrawer {
    /** position matrix of the rectangle to put texture on */
    private rectTransformation = new GpuBufferMatrix3x3(0);
    /** width and height of the rectangle to draw the texture at (in pixels) */
    private rectSize = new GpuFloatBuffer(0, 2);
    /** position of the texture in the texture-buffer */
    private textureLocation = new GpuFloatBuffer(0, 2);
    /** size (width/height) of the texture in the texture-buffer  */
    private textureSize = new GpuFloatBuffer(0, 2);

    /** color for coloring the texture */
    private color = new GpuFloatBuffer(0, 4);
    private textureMap: TextureMap;

    // base instance data
    private indexBuffer = new GpuShortBuffer(0, 1);
    private vertexOffset = new GpuFloatBuffer(0, 2);

    /** this is a unique id to identifies this shader programs */
    private static Id = 'gpu-texture-map-drawer';

    public constructor(textureMap: TextureMap) {
        this.textureMap = textureMap;

        // add 4 vertex-points
        this.vertexOffset.push(-1, -1);
        this.vertexOffset.push(1, -1);
        this.vertexOffset.push(1, 1);
        this.vertexOffset.push(-1, 1);

        // build triangle 1 from the vertex-points
        this.indexBuffer.push(0, 1, 2);
        // build triangle 2 from the vertex-points
        this.indexBuffer.push(0, 2, 3);
    }

    public clear() {
        this.rectTransformation.clear();
        this.rectSize.clear();
        this.textureLocation.clear();
        this.textureSize.clear();
        this.color.clear();
    }

    public add(transformation: Matrix3x3, textureInfo: TextureMapItem, color: Color) {
        this.rectTransformation.pushRange(transformation.values);
        this.rectSize.push(textureInfo.width, textureInfo.height);

        this.textureLocation.push(textureInfo.relativeX, textureInfo.relativeY);
        this.textureSize.push(textureInfo.relativeWidth, textureInfo.relativeHeight);

        this.color.pushRange(color.toArray());
    }

    public addTexture(context: Context, src: TextureGenerator) {
        return this.textureMap.addTexture(context, src);
    }

    public dispose(gl: WebGLRenderingContext) {
        this.textureMap.dispose(gl);
    }

    private static vertexShader = `
        /* transformation to rotate and translate the rect */
        attribute mat3 rectTransformation;
 
        /* width and height of the rectangle to draw the texture at (in pixels) */
        attribute vec2 rectSize;

        /* position of the texture relative to the texture-buffer-size */
        attribute vec2 textureLocation;
        /* size of texture relative to the texture-buffer-size */
        attribute vec2 textureSize;

        /* indicates the position of this vertex in the rect: [-1, -1], [-1, 1] , [1, -1], [1, 1] */
        attribute vec2 vertexOffset;

        /* color for coloring the texture */
        attribute vec4 color;

        /* camera matrix */
        uniform mat3 uniformCamTransformation;
        /* width and height of the screen to convert pixels to screen-coordinates */
        uniform vec2 uniformScalePixel;

        /* ** passing to fragment ** */
        varying vec4 o_color;
        varying vec2 o_textureLocation;
    
        void main() {
            // Calculate the vertex position in screen coordinates
            vec2 realRectSize = rectSize * uniformScalePixel;
            vec3 realPos = uniformCamTransformation * rectTransformation * vec3(realRectSize * vertexOffset, 1.0);
            //realPos = uniformCamTransformation * mat3(1.0, 0.0, 0.0,   0.0, 1.0, 0.0,   0.5, 0.1, 1.0) * vec3(realRectSize * vertexOffset, 1.0);

            vec3 v1 = rectTransformation * vec3(realRectSize * vertexOffset, 1.0);
            realPos = uniformCamTransformation * v1;
            realPos = uniformCamTransformation * mat3(1.0, 0.0, 0.0,   0.0, 1.0, 0.0,   0.5, 0.1, 1.0) * vec3(realRectSize * vertexOffset, 1.0);
            realPos = uniformCamTransformation * mat3(1, 0, 0, 0, 1, 0, 0.5, 0.24, 1) * vec3(realRectSize * vertexOffset, 1.0);
            realPos = uniformCamTransformation * rectTransformation * vec3(realRectSize * vertexOffset, 1.0);

            gl_Position = vec4(realPos.xy, 0.0, 1.0);

            /*
            vec2 realRectPos = vec2(0.5, 0.1);

            vec2 transformed = vec2(
                realRectPos.x + (realRectSize.x * vertexOffset.x * 0.5) ,
                realRectPos.y + (realRectSize.y * vertexOffset.y * 0.5) 
            );

            gl_Position = vec4(transformed.xy, 0.0, 1.0);
            */

            // Pass the texcoord to the fragment shader.
            o_textureLocation = textureLocation + (vertexOffset + 1.0) * 0.5 * textureSize;
            o_color = color;
        }
        `;

    private static fragmentShader = `
        precision mediump float;

        // Passed in from the vertex shader.
        varying vec2 o_textureLocation;
        varying vec4 o_color;

        // texture
        uniform sampler2D uniformTexture;

        void main() {
            gl_FragColor = texture2D(uniformTexture, o_textureLocation) * o_color;
            // gl_FragColor = vec4(1,0,0,1);
        }
        `;

    /** draw a texture from the  */
    public draw(context: Context, cameraTransformation: Matrix3x3) {
        const textureId = this.textureMap.bind(context);
        if (textureId == null) {
            console.error('TextureMapDrawer.draw: Unable to bind texture!');
            return;
        }

        // create and use shader program
        const program = context.useProgram(TextureMapDrawer.Id, TextureMapDrawer.vertexShader, TextureMapDrawer.fragmentShader);

        // bind data buffer to attribute
        context.setArrayBuffer(program, 'vertexOffset', this.vertexOffset);

        context.setInstanceBuffer(program, 'rectTransformation', this.rectTransformation);
        context.setInstanceBuffer(program, 'rectSize', this.rectSize);
        context.setInstanceBuffer(program, 'textureLocation', this.textureLocation);
        context.setInstanceBuffer(program, 'textureSize', this.textureSize);
        context.setInstanceBuffer(program, 'color', this.color);

        // set element-index buffer
        context.setElementBuffer(this.indexBuffer);

        // set uniforms
        context.setUniform(program, 'uniformCamTransformation', cameraTransformation);
        context.setUniform(program, 'uniformTexture', this.textureMap);
        context.setUniform(program, 'uniformScalePixel', new Vector2(0.5 /context.width, 0.5 / context.width));

        // draw textures
        context.angleExtension?.drawElementsInstancedANGLE(
            WebGLRenderingContext.TRIANGLES,
            this.indexBuffer.count,
            WebGLRenderingContext.UNSIGNED_SHORT,
            0,
            this.rectTransformation.count
        );
    }

    /** 
     * Return a html of the texture buffer used by the texture map 
     * - mainly for debugging purposes 
     **/
    public exportToHtmlImage() {
        return this.textureMap.exportToHtmlImage();
    }
}