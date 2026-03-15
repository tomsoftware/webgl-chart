import type { LayoutNode } from "./layout/layout-node";
import type { Scale } from "./scales/scale";
import { Color } from "./color";
import { Context } from "./context";
import { GpuFloatBuffer } from "./buffers/gpu-buffer-float";
import { Matrix3x3 } from "./matrix-3x3";
import { Vector4 } from "./vector-4";
import { GpuNumber } from "./gpu-number";
import { Vector2 } from "./vector-2";
import { DrawableSeries } from "./drawable-series";

export class SeriesPoint implements DrawableSeries {
    protected colorValue = new Vector4(1, 0, 0, 0.5);
    protected bbox = new Vector4(0, 0, 1, 1);
    protected time: GpuFloatBuffer | null = null;
    protected data: GpuFloatBuffer | null = null;
    protected pointSize: GpuNumber = new GpuNumber(2);
    private minMaxPointSizeCache: number[] = [];
  
    /** this is a unique id to identifies this shader programs */
    private static IdPoint = 'gpu-series-point';

    constructor(time: GpuFloatBuffer, data: GpuFloatBuffer | null = null) {
        this.time = time;
        this.data = data;
    }

    /** set the color of the series */
    public setColor(color: Color): SeriesPoint {
        this.colorValue.setFromArray(color.toArray());
        return this;
    }

    /** get the color of the series */
    public get color(): Color {
      return Color.fromFloatArray(this.colorValue.values);
    }

    /** set the point size of the series */
    public setPointSize(size: number): SeriesPoint {
        this.pointSize.set(Math.max(0, size));
        return this;
    }

    public generate(calc: (t: number) => number): SeriesPoint {
        if (this.time == null) {
            return this;
        }

        this.data = GpuFloatBuffer.generateFrom(this.time, calc);

        return this;
    }

    // Question: using emulated double: https://blog.cyclemap.link/2011-06-09-glsl-part2-emu/
    // Question: using double: https://blog.cyclemap.link/2011-07-12-glsl-part3-hwdouble/

    // see: https://webglfundamentals.org/webgl/lessons/webgl-drawing-without-data.html
    private static vertexShaderPoint = `
        attribute float x;
        attribute float y;
        uniform mat3 uniformCamTransformation;
        uniform float uniformPointSize;
        uniform vec4 uniformBounds; // left-top-right-bottom bounds of the chart

        void main() {
          vec3 position = vec3(x, y, 1.0);
          vec3 transformed = uniformCamTransformation * position;

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

    /** read the min-max-point size from gpu */
    private getMinMaxPointSize(gl: WebGLRenderingContext) {
        if (this.minMaxPointSizeCache.length !== 0) {
            return this.minMaxPointSizeCache;
        }
        this.minMaxPointSizeCache = gl.getParameter(WebGLRenderingContext.ALIASED_POINT_SIZE_RANGE);
        return this.minMaxPointSizeCache;
    }

    public draw(context: Context, scaleX: Scale, scaleY: Scale, chartLayout: LayoutNode) {
        if (this.data == null) {
            return;
        }
        const chartArea = chartLayout?.getArea(context.layoutCache);

        const s = Matrix3x3.translate(-scaleX.min, -scaleY.max).scale(chartArea.width / scaleX.range, -chartArea.height / scaleY.range);
        const p = context.projectionMatrix;
        const l = chartArea.toMatrix();

        const m = p.multiply(l.values).multiply(s.values);

        // create and use shader program
        const program = context.useProgram(SeriesPoint.IdPoint, SeriesPoint.vertexShaderPoint, SeriesPoint.fragmentShaderPoint);

        // bind data buffer to attribute
        context.setArrayBuffer(program, 'x', this.time);
        context.setArrayBuffer(program, 'y', this.data);

        // set uniforms
        context.setUniform(program, 'uniformCamTransformation', m);
        context.setUniform(program, 'uniformColor', this.colorValue);
        context.setUniform(program, 'uniformPointSize', this.pointSize.boundFromArray(this.getMinMaxPointSize(context.gl)));

        // set clipping bounds
        const p1 = new Vector2(chartArea.left, chartArea.top).transform(p);
        const p2 = new Vector2(chartArea.right, chartArea.bottom).transform(p);
        context.setUniform(program, 'uniformBounds', this.bbox.set(p1.x, p1.y, p2.x, p2.y));

        // draw buffer / series data
        context.gl.drawArrays(WebGLRenderingContext.POINTS, 0, this.data.count);
    }
}
