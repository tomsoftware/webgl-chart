import type { LayoutNode, Context, IGpuBuffer } from '@tomsoftware/webgl-lib';
import { Color, Matrix3x3, Vector4, Vector2, GpuNumber, GpuBuffer } from '@tomsoftware/webgl-lib';
import type { DrawableSeries } from './drawable-series';
import { Scale } from './scales/scale';

/** Renders a vertical rectangle between y1 and y2-values */
export class SeriesRangeRect implements DrawableSeries {
    protected colorValue1 = new Vector4(0, 0.4, 1, 1);
    protected colorValue2 = new Vector4(1, 0.4, 0, 1);
    protected bBox = new Vector4(0, 0, 1, 1);

    protected x: IGpuBuffer;
    protected y1: IGpuBuffer; // lower value
    protected y2: IGpuBuffer; // upper value

    /** width of each bar in data-units */
    protected barWidth = 1;

    private indexBuffer = new GpuBuffer('uint16', 6, 1);
    private vertexOffset = new GpuBuffer('float32', 4, 2);

    private static IdBar = 'gpu-series-range-rect';

    /**
     * Create new Series Range Rectangle. Draw rect from y1 to y2 at time x
     * @param x Time
     * @param y1 Lower values
     * @param y2 Upper values
     */
    constructor(x: IGpuBuffer, y1: IGpuBuffer, y2: IGpuBuffer) {
        this.x = x;
        this.y1 = y1;
        this.y2 = y2;

        // vertex offsets
        this.vertexOffset.push(-1, 1);  // top-left
        this.vertexOffset.push(1, 1);   // top-right
        this.vertexOffset.push(1, 0);   // bottom-right
        this.vertexOffset.push(-1, 0);  // bottom-left

        this.indexBuffer.push(0, 1, 2); // triangle 1
        this.indexBuffer.push(0, 2, 3); // triangle 2
    }

    /**
     * set the fill color of the rectangular, using
     *   color =  (y1 >= y2) ? color1 : color2
     * if color2 is not set color2 = color1
     */
    public setColor(color1: Color, color2: Color | undefined = undefined): SeriesRangeRect {
        this.colorValue1.setFromArray(color1.toArray());
        this.colorValue2.setFromArray((color2 ?? color1).toArray());
        return this;
    }

    /** Bar width in scale-units */
    public setBarWidth(value: number): SeriesRangeRect {
        this.barWidth = value;
        return this;
    }

    // Vertex shader for instanced bar drawing
    private static vertexShaderBar = `
        attribute vec2 vertexOffset; // (-1..1) quad
        attribute float x;           // bar x-position (data)
        attribute float y1;          // lower y-value (data)
        attribute float y2;          // upper y-value (data)

        uniform float barWidth;      // width in relative world coordinates

        uniform mat3 uniformCamTransformation;
        uniform vec4 uniformColor1;  // color used for (y1 <= y2)
        uniform vec4 uniformColor2;  // color used for (y1 > y2)

        varying vec2 vPosition;
        varying vec4 vColor;

        void main() {
            vColor = (y1 <= y2) ? uniformColor1 : uniformColor2;

            // transform into world coords
            vec3 worldPos = uniformCamTransformation * vec3(
                // dataX + (vertexOffset.x * barWidth)
                x + (vertexOffset.x * barWidth),
                // interpolate between y1 and y2 based on vertexOffset.y
                mix(y1, y2, vertexOffset.y),
                1.0
            );

            gl_Position = vec4(worldPos.xy, 0.0, 1.0);
            vPosition = worldPos.xy;
        }
    `;

    private static fragmentShaderBar = `
        precision mediump float;

        varying vec4 vColor;
        uniform vec4 uniformBounds;

        varying vec2 vPosition; // position in world

        void main() {
            // clipping to layout element
            if (vPosition.x < uniformBounds.x || vPosition.x > uniformBounds.z ||
                vPosition.y > uniformBounds.y || vPosition.y < uniformBounds.w) {
                discard;
            }

            gl_FragColor = vColor;
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
            SeriesRangeRect.IdBar,
            SeriesRangeRect.vertexShaderBar,
            SeriesRangeRect.fragmentShaderBar
        );

        // Bind buffers
        context.setArrayBuffer(program, 'vertexOffset', this.vertexOffset);

        // Bind instance attributes
        context.setInstanceBuffer(program, 'x', this.x);
        context.setInstanceBuffer(program, 'y1', this.y1);  // lower
        context.setInstanceBuffer(program, 'y2', this.y2);  // upper

        // Set uniforms
        context.setUniform(program, 'uniformCamTransformation', m);
        context.setUniform(program, 'uniformColor1', this.colorValue1);
        context.setUniform(program, 'uniformColor2', this.colorValue2);

        // width is drawn in positive and negative direction
        context.setUniform(program, 'barWidth', new GpuNumber(this.barWidth * 0.5));

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
