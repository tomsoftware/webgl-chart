import { Context } from "./context";
import { GpuBuffer } from "./gpu-buffer";
import { Matrix3x3 } from "./matrix-3x3";
import { Vector4 } from "./vector-4";

export class Series {
    public color = new Vector4(1, 0, 0, 0.5);
    private time: GpuBuffer | null = null;
    private data: GpuBuffer | null = null;

    /** this is a unique id to identyfy the shader programms */
    private static Id = 'gpu-series';

    constructor(time: GpuBuffer, data: GpuBuffer | null = null) {
        this.time = time;
        this.data = data;
    }

    /** set the color of the series */
    public setColor(r: number, g: number, b: number, a: number = 1): Series {
        this.color.set(r, g, b, a);
        return this;
    }

    public generate(calc: (t: number) => number): Series {
        if (this.time == null) {
            return this;
        }

        if (this.data == null) {
            this.data = new GpuBuffer(this.time.length);
        }
        if (this.data.length != this.time.length) {
            this.data = new GpuBuffer(this.time.length);
        }

        const timeData = this.time.data;
        const destData = this.data.data;
        for (let i = 0; i < this.time.length; i++) {
            destData[i] = calc(timeData[i]);
        }

        return this;
    }

    // Question: using emulated double: https://blog.cyclemap.link/2011-06-09-glsl-part2-emu/
    // Question: using double: https://blog.cyclemap.link/2011-07-12-glsl-part3-hwdouble/
    //           dvec2

    // see: https://webglfundamentals.org/webgl/lessons/webgl-drawing-without-data.html
    private static vertexShader = `
        attribute float x;
        attribute float y;
        uniform mat3 uniformTrafo;

        void main() {
          vec3 position = vec3(x, y, 1.0);
          vec3 transformed = uniformTrafo * position;

          gl_Position = vec4(transformed.xy, 0.0, 1.0);
          gl_PointSize = 2.0;
        }`;

    private static fragmentShader = `
        precision mediump float;
        uniform vec4 uniformColor;

        void main() {
          gl_FragColor = uniformColor;
        }
        `;

    public draw(context: Context, trafo: Matrix3x3) {
        if (this.data == null) {
            return;
        }
    
        // create and use shader program
        const program = context.useProgram(Series.Id, Series.vertexShader, Series.fragmentShader);

        // bind data buffer to attribute
        context.setBuffer(program, 'x', this.time);
        context.setBuffer(program, 'y', this.data);

        // set uniforms
        context.setUniform(program, 'uniformTrafo', trafo);
        context.setUniform(program, 'uniformColor', this.color);

        // draw buffer / series data
        const offset = 0;
        context.gl.drawArrays(WebGLRenderingContext.POINTS, offset, this.data.count);
    }
}
