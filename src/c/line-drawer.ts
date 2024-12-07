import type { Color } from "./color";
import type { Context } from "./context";
import type { Matrix3x3 } from "./matrix-3x3";
import type { Vector2 } from "./vector-2";
import { GpuBuffer } from "./gpu-buffer";

/** Draw a batch of lines */
export class LineDrawer {
    private lines = new GpuBuffer(0, 2);
    private colors = new GpuBuffer(0, 4);

    /** this is a unique id to identyfy the shader programms */
    private static Id = 'gpu-line-drawer';

    public draw(context: Context, trafo: Matrix3x3) {
        // create and use shader program
        const program = context.useProgram(LineDrawer.Id, LineDrawer.vertexShader, LineDrawer.fragmentShader);

        // bind data buffer to attribute
        context.setBuffer(program, 'coordinates', this.lines);
        context.setBuffer(program, 'colors', this.colors);

        // set uniforms
        context.setUniform(program, 'uniformTrafo', trafo);

        // draw buffer / series data
        const offset = 0;
        context.gl.drawArrays(WebGLRenderingContext.LINES, offset, this.lines.count);
    }

    public addLine(p1: Vector2, p2: Vector2, color1: Color, color2: Color | null = null): void {
        // vertex 1
        this.lines.push(p1.x, p1.y);
        this.colors.pushRange(color1.toArray());

        // vertex 2
        this.lines.push(p2.x, p2.y);
        if (color2 == null) {
            this.colors.pushRange(color1.toArray());
        }
        else {
            this.colors.pushRange(color2.toArray());
        }
    }

    public dispose(_gl: WebGLRenderingContext) {
        this.lines.clear();
        this.colors.clear();
    }

    public clear() {
        this.lines.clear();
        this.colors.clear();
    }

    private static vertexShader = `
        uniform mat3 uniformTrafo;
        attribute vec2 coordinates;
        attribute vec4 colors;
        varying vec4 v_color;

        void main(void) {
            vec3 position = vec3(coordinates.xy, 1.0);
            vec3 transformed = uniformTrafo * position;
            gl_Position = vec4(transformed.xy, 0.0, 1.0);
            v_color = colors;
        }`;

    private static fragmentShader = `
        precision mediump float;
        varying vec4 v_color;

        void main() {
            gl_FragColor = v_color;
        }
    `;
}
