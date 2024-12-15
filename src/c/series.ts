import type { LayoutNode } from "./layout/layout-node";
import type { Scale } from "./scales/scale";
import { Context } from "./context";
import { GpuFloatBuffer } from "./gpu-float-buffer";
import { Matrix3x3 } from "./matrix-3x3";
import { Vector4 } from "./vector-4";
import { GpuNumber } from "./gpu-number";
import { Vector2 } from "./vector-2";

export class Series {
    public color = new Vector4(1, 0, 0, 0.5);
    public bbox = new Vector4(0, 0, 1, 1);
    private time: GpuFloatBuffer | null = null;
    private data: GpuFloatBuffer | null = null;
    private pointSize: GpuNumber = new GpuNumber(2);
    private minMaxPointSizeCache: number[] = [];
  
    /** this is a unique id to identyfy the shader programms */
    private static IdPoint = 'gpu-series-point';
    private static IdLine = 'gpu-series-line';

    constructor(time: GpuFloatBuffer, data: GpuFloatBuffer | null = null) {
        this.time = time;
        this.data = data;
    }

    /** set the color of the series */
    public setColor(r: number, g: number, b: number, a: number = 1): Series {
        this.color.set(r, g, b, a);
        return this;
    }

    /** set the point size of the series */
    public setPointSize(size: number): Series {
        this.pointSize.set(Math.max(0, size));
        return this;
    }

    public generate(calc: (t: number) => number): Series {
        if (this.time == null) {
            return this;
        }


        this.data = GpuFloatBuffer.generateFrom(this.time, calc);

        return this;
    }

    // Question: using emulated double: https://blog.cyclemap.link/2011-06-09-glsl-part2-emu/
    // Question: using double: https://blog.cyclemap.link/2011-07-12-glsl-part3-hwdouble/
    //           dvec2

    // see: https://webglfundamentals.org/webgl/lessons/webgl-drawing-without-data.html
    private static vertexShaderPoint = `
        attribute float x;
        attribute float y;
        uniform mat3 uniformTrafo;
        uniform float uniformPointSize;
        uniform vec4 uniformBounds; // left-top-right-bottom bounds of the chart

        void main() {
          vec3 position = vec3(x, y, 1.0);
          vec3 transformed = uniformTrafo * position;

          if (transformed.x < uniformBounds.x || transformed.x > uniformBounds.z || transformed.y > uniformBounds.y || transformed.y < uniformBounds.w) {
            gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
            return;
          }

          gl_Position = vec4(transformed.xy, 0.0, 1.0);
          gl_PointSize = uniformPointSize;
        }`;

        private static fragmentShaderPoint = `
          precision mediump float;
          uniform vec4 uniformColor;

          void main() {
            gl_FragColor = uniformColor;
          }
        `;

        private static vertexShaderLine = `
        attribute float x;
        attribute float y;
        uniform mat3 uniformTrafo;
        uniform float uniformPointSize;
        varying vec2 vPosition;

        void main() {
          vec3 position = vec3(x, y, 1.0);
          vec3 transformed = uniformTrafo * position;

          gl_Position = vec4(transformed.xy, 0.0, 1.0);
          gl_PointSize = uniformPointSize;
          vPosition = transformed.xy;
        }`;

    private static fragmentShaderLine = `
        precision mediump float;
        varying vec2 vPosition;
        uniform vec4 uniformColor;
        uniform vec4 uniformBounds; // left-top-right-bottom bounds of the chart

        void main() {
          if (vPosition.x < uniformBounds.x || vPosition.x > uniformBounds.z || vPosition.y > uniformBounds.y || vPosition.y < uniformBounds.w) {
            discard;
          }
          gl_FragColor = uniformColor;
        }
        `;

    /** read the min-max-point size from gpu */
    private getMinMaxPointSize(gl: WebGLRenderingContext) {
        if (this.minMaxPointSizeCache.length !== 0) {
            return this.minMaxPointSizeCache;
        }
        this.minMaxPointSizeCache = gl.getParameter(WebGLRenderingContext.ALIASED_POINT_SIZE_RANGE);
        return this.minMaxPointSizeCache;
    }

    public drawPoints(context: Context, scaleX: Scale, scaleY: Scale, chartLayout: LayoutNode, trafo: Matrix3x3) {
        if (this.data == null) {
            return;
        }
        const chartArea = chartLayout?.getArea(context.layoutCache);

        const s = Matrix3x3.translate(-scaleX.min, scaleY.max).scale(chartArea.width / scaleX.range, chartArea.height / scaleY.range);
        const p = context.projectionMatrix;
        const l = chartArea.toMaxtrix();

        const m = p.multiply(l.values).multiply(s.values);

        // create and use shader program
        const program = context.useProgram(Series.IdPoint, Series.vertexShaderPoint, Series.fragmentShaderPoint);

        // bind data buffer to attribute
        context.setBuffer(program, 'x', this.time);
        context.setBuffer(program, 'y', this.data);

        // set uniforms
        context.setUniform(program, 'uniformTrafo', m);
        context.setUniform(program, 'uniformColor', this.color);
        context.setUniform(program, 'uniformPointSize', this.pointSize.boundFromArray(this.getMinMaxPointSize(context.gl)));

        // set clipping bounds
        const p1 = new Vector2(chartArea.left, chartArea.top).transform(p);
        const p2 = new Vector2(chartArea.right, chartArea.bottom).transform(p);
        context.setUniform(program, 'uniformBounds', this.bbox.set(p1.x, p1.y, p2.x, p2.y));

        // draw buffer / series data
        const offset = 0;
        context.gl.drawArrays(WebGLRenderingContext.POINTS, offset, this.data.count);
    }

    public drawLines(context: Context, scaleX: Scale, scaleY: Scale, chartLayout: LayoutNode, trafo: Matrix3x3) {
        if (this.data == null) {
            return;
        }
        const chartArea = chartLayout?.getArea(context.layoutCache);
  
        const s = Matrix3x3.translate(-scaleX.min, scaleY.max).scale(chartArea.width / scaleX.range, chartArea.height / scaleY.range);
        const p = context.projectionMatrix;
        const l = chartArea.toMaxtrix();
  
        const m = p.multiply(l.values).multiply(s.values);
  
        // create and use shader program
        const program = context.useProgram(Series.IdLine, Series.vertexShaderLine, Series.fragmentShaderLine);
  
        // bind data buffer to attribute
        context.setBuffer(program, 'x', this.time);
        context.setBuffer(program, 'y', this.data);
  
        // set uniforms
        context.setUniform(program, 'uniformTrafo', m);
        context.setUniform(program, 'uniformColor', this.color);
        context.setUniform(program, 'uniformPointSize', this.pointSize);
  
        // set clipping bounds
        const p1 = new Vector2(chartArea.left, chartArea.top).transform(p);
        const p2 = new Vector2(chartArea.right, chartArea.bottom).transform(p);
        context.setUniform(program, 'uniformBounds', this.bbox.set(p1.x, p1.y, p2.x, p2.y));
  
        // draw buffer / series data
        const offset = 0;
        context.gl.drawArrays(WebGLRenderingContext.LINE_STRIP, offset, this.data.count);
    }
}
