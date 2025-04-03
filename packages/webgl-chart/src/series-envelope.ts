import type { LayoutNode } from "./layout/layout-node";
import type { Scale } from "./scales/scale";
import { Color } from "./color";
import { Context } from "./context";
import { GpuFloatBuffer } from "./buffers/gpu-buffer-float";
import { Matrix3x3 } from "./matrix-3x3";
import { Vector4 } from "./vector-4";
import { Vector2 } from "./vector-2";
import { GpuShortBuffer } from "./buffers/gpu-buffer-short";
import { GpuBufferView } from "./buffers/buffer-view";

export class SeriesEnvelope {
    protected upperColorValue = new Vector4(1, 0, 0, 0.5);
    protected lowerColorValue = new Vector4(1, 0, 0, 0.5);
    public bbox = new Vector4(0, 0, 1, 1);
    protected time: GpuFloatBuffer | null = null;
    protected upperData: GpuFloatBuffer | null = null;
    protected lowerData: GpuFloatBuffer | null = null;

    // base instance data
    private indexBuffer = new GpuShortBuffer(6, 1);
    private vertexOffset = new GpuFloatBuffer(4, 2);

    /** this is a unique id to identifies this shader programs */
    private static Id = 'gpu-series-envelope';

    constructor(time: GpuFloatBuffer, upper: GpuFloatBuffer | null = null, lower: GpuFloatBuffer | null = null) {
        this.time = time;
        this.upperData = upper;
        this.lowerData = lower;

        // add 4 vertex-points
        this.vertexOffset.push(-1, 0);
        this.vertexOffset.push(1, 0);
        this.vertexOffset.push(1, 1);
        this.vertexOffset.push(-1, 1);

        // build triangle 1 from the vertex-points
        this.indexBuffer.push(0, 1, 2);
        // build triangle 2 from the vertex-points
        this.indexBuffer.push(0, 2, 3);
    }

    /** set the color of the series - using same color for lowerColor if not set */
    public setColor(upperColor: Color, lowerColor?: Color | null): SeriesEnvelope {
        if (lowerColor == null) {
          lowerColor = upperColor;
        }

        this.upperColorValue.setFromArray(upperColor.toArray());
        this.lowerColorValue.setFromArray(lowerColor.toArray());

        return this;
    }

    /** get the color of the series */
    public get colorUpper(): Color {
      return Color.fromFloatArray(this.upperColorValue.values);
    }

    public get colorLower(): Color {
      return Color.fromFloatArray(this.lowerColorValue.values);
    }

    /*
    *     x1    x2
    *  uY1 |---/| uY2
    *      |  / |
    *      | /  |
    *  lY1 |/---| lY2
    */
    private static vertexShader = `
        attribute float x1;
        attribute float x2;
        attribute float upperY1;
        attribute float upperY2;
        attribute float lowerY1;
        attribute float lowerY2;

        // indicates the position of this vertex in the rect
        attribute vec2 vertexOffset;

        uniform mat3 uniformCamTransformation;
        uniform vec4 uniformUpperColor;
        uniform vec4 uniformLowerColor;
        varying vec2 vPosition;
        varying vec4 vColor;

        void main() {
          float y;
          float x;
          if (vertexOffset.x < 0.0) {
             y = mix(upperY1, lowerY1, vertexOffset.y);
             x = x1;
          }
          else {
             y = mix(upperY2, lowerY2, vertexOffset.y);
             x = x2;
          }

          vec3 position = vec3(x, y, 1.0);
          vec3 transformed = uniformCamTransformation * position;

          gl_Position = vec4(transformed.xy, 0.0, 1.0);
          vColor = mix(uniformUpperColor, uniformLowerColor, vertexOffset.y);
          vPosition = transformed.xy;
        }`;

    private static fragmentShader = `
        precision mediump float;
        varying vec2 vPosition;
        varying vec4 vColor;
        uniform vec4 uniformBounds; // left-top-right-bottom bounds of the chart

        void main() {
          if (vPosition.x < uniformBounds.x || vPosition.x > uniformBounds.z || vPosition.y > uniformBounds.y || vPosition.y < uniformBounds.w) {
             discard;
          }
          gl_FragColor = vColor;
        }
        `;

    public draw(context: Context, scaleX: Scale, scaleY: Scale, chartLayout: LayoutNode) {
        if (this.upperData == null || this.lowerData == null) {
            return;
        }

        const chartArea = chartLayout?.getArea(context.layoutCache);
  
        const s = Matrix3x3.translate(-scaleX.min, -scaleY.max).scale(chartArea.width / scaleX.range, -chartArea.height / scaleY.range);
        const p = context.projectionMatrix;
        const l = chartArea.toMatrix();
        const m = p.multiply(l.values).multiply(s.values);

        // create and use shader program
        const program = context.useProgram(SeriesEnvelope.Id, SeriesEnvelope.vertexShader, SeriesEnvelope.fragmentShader);
  
        // bind data buffer to attribute
        context.setArrayBuffer(program, 'vertexOffset', this.vertexOffset);

        context.setInstanceBuffer(program, 'x1', this.time);
        context.setInstanceBuffer(program, 'x2', this.time, new GpuBufferView(1, 1));
        context.setInstanceBuffer(program, 'upperY1', this.upperData);
        context.setInstanceBuffer(program, 'lowerY1', this.lowerData);
        context.setInstanceBuffer(program, 'upperY2', this.upperData, new GpuBufferView(1, 1));
        context.setInstanceBuffer(program, 'lowerY2', this.lowerData, new GpuBufferView(1, 1));

        // set uniforms
        context.setUniform(program, 'uniformUpperColor', this.upperColorValue);
        context.setUniform(program, 'uniformLowerColor', this.lowerColorValue);
  
        // set element-index buffer
        context.setElementBuffer(this.indexBuffer);

        // set clipping bounds
        const p1 = new Vector2(chartArea.left, chartArea.top).transform(p);
        const p2 = new Vector2(chartArea.right, chartArea.bottom).transform(p);
        context.setUniform(program, 'uniformBounds', this.bbox.set(p1.x, p1.y, p2.x, p2.y));

        context.setUniform(program, 'uniformCamTransformation', m);
    
        // draw rectangles
        context.angleExtension?.drawElementsInstancedANGLE(
          WebGLRenderingContext.TRIANGLES,
          this.indexBuffer.count,
          WebGLRenderingContext.UNSIGNED_SHORT,
          0,
          (this.upperData.count - 1)
      );
    }
}
