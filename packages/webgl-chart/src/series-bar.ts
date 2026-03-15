import type { LayoutNode } from './layout/layout-node';
import type { Scale } from './scales/scale';
import { Color } from './color';
import { Context } from './context';
import { GpuFloatBuffer } from './buffers/gpu-buffer-float';
import { GpuShortBuffer } from './buffers/gpu-buffer-short';
import { Matrix3x3 } from './matrix-3x3';
import { Vector4 } from './vector-4';
import { Vector2 } from './vector-2';
import { DrawableSeries } from './drawable-series';

/** Renders a vertical bar chart series defined by x- and y-values */
export class SeriesBar implements DrawableSeries {
    protected colorValue = new Vector4(0, 0.4, 1, 1);
    protected bBox = new Vector4(0, 0, 1, 1);

    protected x: GpuFloatBuffer | null = null;
    protected y: GpuFloatBuffer | null = null;

    /** width of each bar in data-units */
    protected barWidth = 1;

    /** x-offset in data-units for multi-series alignment */
    protected offsetX = 0;

    private indexBuffer = new GpuShortBuffer(6, 1);
    private vertexOffset = new GpuFloatBuffer(4, 2);

    private static IdBar = 'gpu-series-bar';

    constructor(x: GpuFloatBuffer, y: GpuFloatBuffer) {
        this.x = x;
        this.y = y;

        // vertex offsets
        this.vertexOffset.push(-1, 1);  // top-left
        this.vertexOffset.push(1, 1);   // top-right
        this.vertexOffset.push(1, 0);   // bottom-right
        this.vertexOffset.push(-1, 0);  // bottom-left

        this.indexBuffer.push(0, 1, 2); // triangle 1
        this.indexBuffer.push(0, 2, 3); // triangle 2
    }

    public setColor(color: Color): SeriesBar {
        this.colorValue.setFromArray(color.toArray());
        return this;
    }

    /** Bar width in scale-units */
    public setBarWidth(value: number): SeriesBar {
        this.barWidth = value;
        return this;
    }

    /** Bar offset in X in scale-units */
    public setOffsetX(value: number): SeriesBar {
        this.offsetX = value;
        return this;
    }

    // Vertex shader for instanced bar drawing
    private static vertexShaderBar = `
        attribute vec2 vertexOffset; // (-1..1) quad
        attribute float x;           // bar x-position (data)
        attribute float y;           // bar height (data)

        uniform vec2 barWidth;      // width in relative world coordinates
        uniform vec2 barOffset;     // x-offset in relative world coordinates

        uniform mat3 uniformCamTransformation;

        varying vec2 vPosition;

        void main() {
            // transform into world coords
            vec3 worldPos = uniformCamTransformation * vec3(
                // dataX + offsetX + barWidth
                x + barOffset.x + (vertexOffset.x * barWidth.x),
                // set y to 0 for bottom vertexes
                y * vertexOffset.y,
                1.0
            );

            gl_Position = vec4(worldPos.xy, 0.0, 1.0);
            vPosition = worldPos.xy;
        }
    `;

    private static fragmentShaderBar = `
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
        if (this.x == null || this.y == null) {
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
            SeriesBar.IdBar,
            SeriesBar.vertexShaderBar,
            SeriesBar.fragmentShaderBar
        );

        // Bind buffers
        context.setArrayBuffer(program, 'vertexOffset', this.vertexOffset);

        // Bind instance attributes
        context.setInstanceBuffer(program, 'x', this.x);
        context.setInstanceBuffer(program, 'y', this.y);

        // Set uniforms
        context.setUniform(program, 'uniformCamTransformation', m);
        context.setUniform(program, 'uniformColor', this.colorValue);

        context.setUniform(program, 'barWidth', new Vector2(
            this.barWidth * 0.5, // width is drawn in positive and negative direction
            0 // height is defined by y
        ));
        context.setUniform(program, 'barOffset', new Vector2(
            this.offsetX,
            0 // no offset in y
        ));

        // Set clipping bounds
        const p1 = new Vector2(layoutArea.left, layoutArea.top).transform(p);
        const p2 = new Vector2(layoutArea.right, layoutArea.bottom).transform(p);
        context.setUniform(program, 'uniformBounds', this.bBox.set(p1.x, p1.y, p2.x, p2.y));

        // Draw instanced
        context.angleExtension?.drawElementsInstancedANGLE(
            WebGLRenderingContext.TRIANGLES,
            this.indexBuffer.count,
            WebGLRenderingContext.UNSIGNED_SHORT,
            0,
            this.x.count
        );
    }
}
