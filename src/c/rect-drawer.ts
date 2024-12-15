import type { Color } from "./color";
import type { Context } from "./context";
import type { Matrix3x3 } from "./matrix-3x3";
import type { Vector2 } from "./vector-2";
import { GpuFloatBuffer } from "./gpu-float-buffer";

/** Draw a batch of Rectangle */
export class RectDrawer {
    private points = new GpuFloatBuffer(0, 2);
    private colors = new GpuFloatBuffer(0, 4);
    private texcoordLocation = new GpuFloatBuffer(0, 2);

    /** this is a unique id to identyfy the shader programms */
    private static Id = 'gpu-rect-drawer';

    public draw(context: Context, trafo: Matrix3x3) {
        // create and use shader program
        const program = context.useProgram(RectDrawer.Id, RectDrawer.vertexShader, RectDrawer.fragmentShader);

        // bind data buffer to attribute
        context.setBuffer(program, 'coordinates', this.points);
        context.setBuffer(program, 'colors', this.colors);
        context.setBuffer(program, 'texcoord', this.texcoordLocation);

        // set uniforms
        context.setUniform(program, 'uniformTrafo', trafo);

        // draw buffer / series data
        const offset = 0;
        context.gl.drawArrays(WebGLRenderingContext.TRIANGLES, offset, this.points.count);
    }

    public addRect(pos: Vector2, size: Vector2, color1: Color): void {
        // triangle 1
        // vertex 1
        this.points.push(pos.x, pos.y);
        this.colors.pushRange(color1.toArray());
        this.texcoordLocation.push(-1, -1);

        // vertex 2
        this.points.push(pos.x + size.x, pos.y);
        this.colors.pushRange(color1.toArray());
        this.texcoordLocation.push(1, -1);

        // vertex 3
        this.points.push(pos.x + size.x, pos.y + size.y);
        this.colors.pushRange(color1.toArray());
        this.texcoordLocation.push(1, 1);

        // triangle 2
        // vertex 1
        this.points.push(pos.x, pos.y);
        this.colors.pushRange(color1.toArray());
        this.texcoordLocation.push(-1, -1);

        // vertex 2
        this.points.push(pos.x + size.x, pos.y + size.y);
        this.colors.pushRange(color1.toArray());
        this.texcoordLocation.push(1, 1);

        // vertex 3
        this.points.push(pos.x, pos.y + size.y);
        this.colors.pushRange(color1.toArray());
        this.texcoordLocation.push(-1, 1);
    }

    public dispose(_gl: WebGLRenderingContext) {
        this.points.clear();
        this.colors.clear();
        this.texcoordLocation.clear();
    }

    public clear() {
        this.points.clear();
        this.colors.clear();
        this.texcoordLocation.clear();
    }

    // https://stackoverflow.com/questions/68233304/how-to-create-a-proper-rounded-rectangle-in-webgl

    private static vertexShader = `
        uniform mat3 uniformTrafo;
        attribute vec2 coordinates;
        attribute vec4 colors;
        attribute vec2 texcoord;
        varying vec4 v_color;
        varying vec2 v_texcoord;

        void main(void) {
            vec3 position = vec3(coordinates.xy, 1.0);
            vec3 transformed = uniformTrafo * position;
            gl_Position = vec4(transformed.xy, 0.0, 1.0);
            v_color = colors;
            // Pass the texcoord to the fragment shader.
            v_texcoord = texcoord;
        }`;

    private static fragmentShader = `
        precision mediump float;
        varying vec4 v_color;
        // Passed in from the vertex shader.
        varying vec2 v_texcoord;

        /*
        float calcRadius(vec2 uExtents, float uRadius) {
            vec2 coords = abs(v_texcoord) * (uExtents + uRadius);
            vec2 delta = max(coords - uExtents, vec2(0,0));
            return length(delta) - uRadius;
        }
        */
        float calcRadius(vec2 uExtents, float uRadius) {
            vec2 scaledCoords = abs(v_texcoord) * (uExtents + uRadius);
            vec2 clampedCoords = max(scaledCoords - uExtents, 0.0);
            return length(clampedCoords) - uRadius;
        }

        void main() {
            if (calcRadius(vec2(1000.0 * 0.5, 1000.0 * 0.5), 60.0) > 0.0)
            {
                discard;
            }
            gl_FragColor = v_color;
        }
    `;
}
