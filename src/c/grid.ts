import { Context } from "./context";
import { GpuBuffer } from "./gpu-buffer";
import { Matrix3x3 } from "./matrix-3x3";
import { Vector4 } from "./vector-4";

export class Grid {
    public color = new Vector4(1, 0, 0, 0.5);
    private lines = new GpuBuffer(0, 2);

    /** this is a unique id to identyfy the shader programms */
    private static Id = 'gpu-grid';

    /** set the color of the series */
    public setColor(r: number, g: number, b: number, a: number = 1): Grid {
        this.color.set(r, g, b, a);
        return this;
    }

    public generateLine(x1: number, y1: number, x2: number, y2: number): Grid {
        this.lines.push(x1, y1);
        this.lines.push(x2, y2);
        return this;
    }

    public generateHoritontal(num: number): Grid {
        // Horizontale Linien
        for (let i = 0; i <= num; i++) {
            let y = -0.5 + i * (1 / num);
            this.generateLine(-0.5, y, 0.5, y);
        }
        return this;
    }

    public generateVertical(num: number): Grid {
        // Vertikale Linien
        for (let i = 0; i <= num; i++) {
            let x = -0.5 + i * (1 / num);
            this.generateLine(x, -0.5, x, 0.5);
        }
        return this;
    }

    private static vertexShader = `
        attribute vec2 coordinates;
        uniform mat3 uniformTrafo;

        void main(void) {
            vec3 position = vec3(coordinates.xy, 1.0);
            vec3 transformed = uniformTrafo * position;
            gl_Position = vec4(transformed.xy, 0.0, 1.0);
        }`;

    private static fragmentShader = `
        precision mediump float;
        uniform vec4 uniformColor;

        void main() {
            gl_FragColor = uniformColor;
        }
        `;

    public draw(context: Context, trafo: Matrix3x3) {
        // create and use shader program
        const program = context.useProgram(Grid.Id, Grid.vertexShader, Grid.fragmentShader);

        // bind data buffer to attribute
        context.setBuffer(program, 'coordinates', this.lines);

        // set uniforms
        context.setUniform(program, 'uniformTrafo', trafo);
        context.setUniform(program, 'uniformColor', this.color);

        //this.trafoUniform.bind(context.gl, program, trafo);
        //this.colorUniform.bind(context.gl, program, this.color);

        // draw buffer / series data
        const offset = 0;
        context.gl.drawArrays(WebGLRenderingContext.LINES, offset, this.lines.count);
    }
    
}