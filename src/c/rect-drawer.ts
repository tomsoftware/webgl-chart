import type { Color } from "./color";
import type { Context } from "./context";
import type { Matrix3x3 } from "./matrix-3x3";
import type { Vector2 } from "./vector-2";
import { GpuFloatBuffer } from "./buffers/gpu-buffer-float";
import { GpuShortBuffer } from "./buffers/gpu-buffer-short";

/** Draw a batch of Rectangle */
export class RectDrawer {
    private coordinates = new GpuFloatBuffer(0, 2);
    private colors = new GpuFloatBuffer(0, 4);
    private texcoordLocation = new GpuFloatBuffer(0, 2);
    private rectSize = new GpuFloatBuffer(0, 2);
    private stripeWidth = new GpuFloatBuffer(0, 2);
    private borderRadius = new GpuFloatBuffer(0, 1);
    private indexBuffer = new GpuShortBuffer(0, 1);

    /** this is a unique id to identyfy the shader programms */
    private static Id = 'gpu-rect-drawer';

    public draw(context: Context, trafo: Matrix3x3) {
        // create and use shader program
        const program = context.useProgram(RectDrawer.Id, RectDrawer.vertexShader, RectDrawer.fragmentShader);

        // bind data buffer to attribute
        context.setArrayBuffer(program, 'coordinates', this.coordinates);
        context.setArrayBuffer(program, 'colors', this.colors);
        context.setArrayBuffer(program, 'texcoord', this.texcoordLocation);
        context.setArrayBuffer(program, 'rectSize', this.rectSize);
        context.setArrayBuffer(program, 'borderRadius', this.borderRadius);
        context.setArrayBuffer(program, 'stripeWidth', this.stripeWidth);

        context.setElementBuffer(this.indexBuffer);

        // set uniforms
        context.setUniform(program, 'uniformTrafo', trafo);

        // draw buffer / series data
        const offset = 0;
        context.gl.drawElements(WebGLRenderingContext.TRIANGLES, this.indexBuffer.count, WebGLRenderingContext.UNSIGNED_SHORT, offset);
    }

    public addRect(pos: Vector2, size: Vector2, color1: Color, borderRadius: number, stripeWidthX: number = 0, stripeWidthY: number = 0): void {
        borderRadius = borderRadius * 0.5;

        const indexOffset = this.coordinates.count;

        // vertex 1
        this.coordinates.push(pos.x, pos.y);
        this.colors.pushRange(color1.toArray());
        this.texcoordLocation.push(-1, -1);
        this.rectSize.pushRange(size.values);
        this.borderRadius.push(borderRadius);
        this.stripeWidth.push(stripeWidthX, stripeWidthY);

        // vertex 2
        this.coordinates.push(pos.x + size.x, pos.y);
        this.colors.pushRange(color1.toArray());
        this.texcoordLocation.push(1, -1);
        this.rectSize.pushRange(size.values);
        this.borderRadius.push(borderRadius);
        this.stripeWidth.push(stripeWidthX, stripeWidthY);
        
        // vertex 3
        this.coordinates.push(pos.x + size.x, pos.y + size.y);
        this.colors.pushRange(color1.toArray());
        this.texcoordLocation.push(1, 1);
        this.rectSize.pushRange(size.values);
        this.borderRadius.push(borderRadius);
        this.stripeWidth.push(stripeWidthX, stripeWidthY);

        // vertex 4
        this.coordinates.push(pos.x, pos.y + size.y);
        this.colors.pushRange(color1.toArray());
        this.texcoordLocation.push(-1, 1);
        this.rectSize.pushRange(size.values);
        this.borderRadius.push(borderRadius);
        this.stripeWidth.push(stripeWidthX, stripeWidthY);

        // triangle 1
        this.indexBuffer.push(indexOffset + 0, indexOffset + 1, indexOffset + 2);
        // triangle 2
        this.indexBuffer.push(indexOffset + 0, indexOffset + 2, indexOffset + 3);
    }

    public dispose(_gl: WebGLRenderingContext) {
        this.clear();
    }

    public clear() {
        this.coordinates.clear();
        this.colors.clear();
        this.texcoordLocation.clear();
        this.rectSize.clear();
        this.borderRadius.clear();
        this.stripeWidth.clear();
        this.indexBuffer.clear();
    }

    // https://stackoverflow.com/questions/68233304/how-to-create-a-proper-rounded-rectangle-in-webgl

    private static vertexShader = `
        uniform mat3 uniformTrafo;
        attribute vec2 coordinates;
        attribute vec4 colors;
        attribute vec2 texcoord;
        attribute vec2 rectSize;
        attribute vec2 stripeWidth;
        attribute float borderRadius;

        varying vec4 v_color;
        varying vec2 uv;
        varying vec2 o_rectSize;
        varying vec2 o_stripeWidth;
        varying float o_borderRadius;

        void main(void) {
            vec3 position = vec3(coordinates.xy, 1.0);
            vec3 transformed = uniformTrafo * position;
            gl_Position = vec4(transformed.xy, 0.0, 1.0);
            v_color = colors;
            // Pass the texcoord to the fragment shader.
            uv = texcoord;
            o_rectSize = vec2(1.0, rectSize.y / rectSize.x);
            o_borderRadius = borderRadius;
            o_stripeWidth = stripeWidth;
        }`;

    private static fragmentShader = `
        precision mediump float;

        // Passed in from the vertex shader.
        varying vec4 v_color;
        varying vec2 uv;
        varying vec2 o_rectSize;
        varying vec2 o_stripeWidth;
        varying float o_borderRadius;

        void main() {
            vec2 stripe = mod(uv * o_rectSize / o_stripeWidth, 2.0);
            if ((stripe.x < 1.0) || (stripe.y < 1.0))
            {
                discard;
            }

            if (length(max(abs(uv * o_rectSize) - o_rectSize + o_borderRadius, 0.0)) > o_borderRadius) {
                discard;
            }

            gl_FragColor = v_color;
        }
    `;
}
