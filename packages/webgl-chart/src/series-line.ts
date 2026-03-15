import type { LayoutNode } from "./layout/layout-node";
import type { Scale } from "./scales/scale";
import { Color } from "./color";
import { Context } from "./context";
import { GpuFloatBuffer } from "./buffers/gpu-buffer-float";
import { Matrix3x3 } from "./matrix-3x3";
import { Vector4 } from "./vector-4";
import { Vector2 } from "./vector-2";
import { DrawableSeries } from "./drawable-series";

export class SeriesLine implements DrawableSeries {
    protected colorValue = new Vector4(1, 0, 0, 0.5);
    protected bbox = new Vector4(0, 0, 1, 1);
    protected thickness: number = 1;
    protected time: GpuFloatBuffer | null = null;
    protected data: GpuFloatBuffer | null = null;
  
    /** this is a unique id to identifies this shader programs */
    private static IdLine = 'gpu-series-line';

    constructor(time: GpuFloatBuffer, data: GpuFloatBuffer | null = null) {
        this.time = time;
        this.data = data;
    }

    /** set the color of the series */
    public setColor(color: Color): SeriesLine {
        this.colorValue.setFromArray(color.toArray());
        return this;
    }

    /** get the color of the series */
    public get color(): Color {
      return Color.fromFloatArray(this.colorValue.values);
    }

    /** set the line thickness */
    public setThickness(thickness: number) {
      this.thickness = Math.max(0, +thickness);
      return this;
    }

    public generate(calc: (t: number) => number): SeriesLine {
        if (this.time == null) {
            return this;
        }

        this.data = GpuFloatBuffer.generateFrom(this.time, calc);

        return this;
    }

    private static vertexShaderLine = `
        attribute float x;
        attribute float y;
        uniform mat3 uniformCamTransformation;
        varying vec2 vPosition;

        void main() {
          vec3 position = vec3(x, y, 1.0);
          vec3 transformed = uniformCamTransformation * position;

          gl_Position = vec4(transformed.xy, 0.0, 1.0);
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

    public draw(context: Context, scaleX: Scale, scaleY: Scale, chartLayout: LayoutNode) {
        if (this.data == null) {
            return;
        }
        if (this.thickness < 1) {
          // don't draw lines with no thickness
          return;
        }

        const chartArea = chartLayout?.getArea(context.layoutCache);
  
        const s = Matrix3x3.translate(-scaleX.min, -scaleY.max).scale(chartArea.width / scaleX.range, -chartArea.height / scaleY.range);
        const p = context.projectionMatrix;
        const l = chartArea.toMatrix();
  
        // create and use shader program
        const program = context.useProgram(
          SeriesLine.IdLine,
          SeriesLine.vertexShaderLine,
          SeriesLine.fragmentShaderLine
        );
  
        // bind data buffer to attribute
        context.setArrayBuffer(program, 'x', this.time);
        context.setArrayBuffer(program, 'y', this.data);
  
        // set uniforms
        context.setUniform(program, 'uniformColor', this.colorValue);
  
        // set clipping bounds
        const p1 = new Vector2(chartArea.left, chartArea.top).transform(p);
        const p2 = new Vector2(chartArea.right, chartArea.bottom).transform(p);
        context.setUniform(program, 'uniformBounds', this.bbox.set(p1.x, p1.y, p2.x, p2.y));

        // draw buffer / series data
        const offset = 0;
        const count = this.data.count;
        const pixelScale = context.pixelScale;

        // pure man's thick line -> just draw the line multiple times
        const baseOffset = (this.thickness % 2 == 0) ? 0.5 : 0.0; // returns 0 or 0.5
        const baseOffsetY = pixelScale.y * baseOffset;

        for (let i = 0; i < this.thickness; i++) {
          const sign = (i % 2 === 0) ? 1 : -1;
          const f = sign * (i + 1) >> 1; // f is oscillates around the center: 0, -1, 1, -2, 2 or -0.5

          const lineThicknessShift = Matrix3x3.translate(0, baseOffsetY + pixelScale.y * f);

          const m = p.multiply(l.values).multiply(lineThicknessShift.values).multiply(s.values);
          context.setUniform(program, 'uniformCamTransformation', m);
          context.gl.drawArrays(WebGLRenderingContext.LINE_STRIP, offset, count);
          
        }

    }
}
