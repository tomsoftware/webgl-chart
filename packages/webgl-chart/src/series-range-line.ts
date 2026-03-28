import type { LayoutNode, Context, IGpuBuffer } from '@tomsoftware/webgl-lib';
import { Color, GpuBuffer, Matrix3x3, Vector4, Vector2 } from '@tomsoftware/webgl-lib';
import type { DrawableSeries } from './drawable-series';
import { Scale } from './scales/scale';

/** Renders a vertical line between y1 and y2-values */
export class SeriesRangeLine implements DrawableSeries {
    protected colorValue = new Vector4(0, 0.4, 1, 1);
    protected bBox = new Vector4(0, 0, 1, 1);

    protected x: IGpuBuffer;
    protected y1: IGpuBuffer;
    protected y2: IGpuBuffer;

    /** line width in pixels */
    protected lineWidth = 1;

    private indexBuffer = new GpuBuffer('uint16', 2, 1);
    private vertexOffset = new GpuBuffer('float32', 2, 2);

    private static IdLine = 'gpu-series-range-line';

    constructor(x: IGpuBuffer, y1: IGpuBuffer, y2: IGpuBuffer) {
        this.x = x;
        this.y1 = y1;
        this.y2 = y2;

        // vertex offsets for line (top and bottom point)
        this.vertexOffset.push(0, 1);  // top point
        this.vertexOffset.push(0, 0);  // bottom point

        this.indexBuffer.push(0, 1);   // line from top to bottom
    }

    public setColor(color: Color): SeriesRangeLine {
        this.colorValue.setFromArray(color.toArray());
        return this;
    }

    /** Rectangular width in pixels */
    public setLineWidth(value: number): SeriesRangeLine {
        this.lineWidth = value;
        return this;
    }

    // Vertex shader for instanced line drawing
    private static vertexShaderLine = `
        attribute vec2 vertexOffset; // (0,0) or (0,1) for line endpoints
        attribute float x;           // line x-position (data)
        attribute float y1;          // lower y-value (data)
        attribute float y2;          // upper y-value (data)

        uniform mat3 uniformCamTransformation;

        varying vec2 vPosition;

        void main() {
            // transform into world coords
            vec3 worldPos = uniformCamTransformation * vec3(
                x,
                mix(y1, y2, vertexOffset.y),
                1.0
            );

            gl_Position = vec4(worldPos.xy, 0.0, 1.0);
            vPosition = worldPos.xy;
        }
    `;

    private static fragmentShaderLine = `
        precision mediump float;

        uniform vec4 uniformColor;
        uniform vec4 uniformBounds;

        varying vec2 vPosition; // position in world

        void main() {
            // clipping to layout element
            if (vPosition.x < uniformBounds.x || vPosition.x > uniformBounds.z ||
                vPosition.y > uniformBounds.y || vPosition.y < uniformBounds.w) {
                discard;
            }

            gl_FragColor = uniformColor;
        }
    `;

    public draw(context: Context, scaleX: Scale, scaleY: Scale, chartLayout: LayoutNode) {
        if (this.x == null || this.y1 == null || this.y2 == null) {
            return;
        }

        const layoutArea = chartLayout.getArea(context.layoutCache);

        const s = Matrix3x3
            .translate(-scaleX.min, -scaleY.max)
            .scale(layoutArea.width / scaleX.range, -layoutArea.height / scaleY.range);
        const p = context.projectionMatrix;
        const l = layoutArea.toMatrix();

        const m = p.multiply(l.values).multiply(s.values);

        const program = context.useProgram(
            SeriesRangeLine.IdLine,
            SeriesRangeLine.vertexShaderLine,
            SeriesRangeLine.fragmentShaderLine
        );

        // Bind buffers
        context.setArrayBuffer(program, 'vertexOffset', this.vertexOffset);

        // Bind instance attributes
        context.setInstanceBuffer(program, 'x', this.x);
        context.setInstanceBuffer(program, 'y1', this.y1);
        context.setInstanceBuffer(program, 'y2', this.y2);

        // Set uniforms
        context.setUniform(program, 'uniformCamTransformation', m);
        context.setUniform(program, 'uniformColor', this.colorValue);

        // Set clipping bounds
        const p1 = new Vector2(layoutArea.left, layoutArea.top).transform(p);
        const p2 = new Vector2(layoutArea.right, layoutArea.bottom).transform(p);
        context.setUniform(program, 'uniformBounds', this.bBox.set(p1.x, p1.y, p2.x, p2.y));

        // Draw instanced with LINE_STRIP
        context.angleExtension?.drawElementsInstancedANGLE(
            WebGLRenderingContext.LINE_STRIP,
            this.indexBuffer.count,
            WebGLRenderingContext.UNSIGNED_SHORT,
            0,
            this.x.count
        );
    }
}
