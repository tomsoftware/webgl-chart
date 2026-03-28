import type { LayoutNode, Context, GpuBuffer } from '@tomsoftware/webgl-lib';
import { Color, GpuBuffer, Matrix3x3, Vector4, GpuBuffer,  Vector2 } from '@tomsoftware/webgl-lib';
import type { DrawableSeries } from './drawable-series';
import { Scale } from './scales/scale';

/** Renders a bubble chart series defined by x‑, y‑ and radius‑values */
export class SeriesBubble implements DrawableSeries {
    /** color of the circles */
    protected colorValue = new Vector4(1, 0, 0, 0.5);
    /** scaling of the circles */
    protected scaling = 1;
    protected bBox = new Vector4(0, 0, 1, 1);
    protected x: GpuBuffer;
    protected y: GpuBuffer;
    protected radius: GpuBuffer;

    // base instance data
    private indexBuffer = new GpuBuffer('uint16', 6, 1);
    private vertexOffset = new GpuBuffer('float32', 4, 2);
    private quadTexcoords = new GpuBuffer('float32', 4, 2);

    /** this is a unique id to identifies this shader programs */
    private static IdCircle = 'gpu-series-bubble';

    constructor(x: GpuBuffer, y: GpuBuffer, radius: GpuBuffer) {
        this.x = x;
        this.y = y;
        this.radius = radius;

        // add 4 vertex-points
        this.vertexOffset.push(-1, -1);
        this.vertexOffset.push(1, -1);
        this.vertexOffset.push(1, 1);
        this.vertexOffset.push(-1, 1);

        // build triangle 1 from the vertex-points
        this.indexBuffer.push(0, 1, 2);
        // build triangle 2 from the vertex-points
        this.indexBuffer.push(0, 2, 3);

        // texture coordinates to clip rect to circle
        this.quadTexcoords.push(0, 0);
        this.quadTexcoords.push(1, 0);
        this.quadTexcoords.push(1, 1);
        this.quadTexcoords.push(0, 1);
    }

    /** set the color of the series */
    public setColor(color: Color): SeriesBubble {
        this.colorValue.setFromArray(color.toArray());
        return this;
    }

    /** get the color of the series */
    public get color(): Color {
        return Color.fromFloatArray(this.colorValue.values);
    }

    public setBubbleScaling(scale: number): SeriesBubble {
        this.scaling = scale;
        return this;
    }

    public get bubbleScaling(): number {
        return this.scaling;
    }

    /** dispose data */
    public clear() {
        this.x?.clear();
        this.y?.clear();
        this.radius?.clear();
    }


    // Vertex shader for instanced circle drawing
    private static vertexShaderCircle = `
        attribute vec2 vertexOffset;   // quad offsets (-1..1)
        attribute vec2 texcoord;       // 0..1 texcoords
        attribute float x;             // center x
        attribute float y;             // center y
        attribute float radius;        // radius in unknown-scaling e.g. (5..30)

        uniform vec2 radiusScaling;    // scaling radius to screen
        uniform mat3 uniformCamTransformation;

        // position of the vertex in screen for clipping
        varying vec2 vPosition;

        varying vec2 vTexcoord;

        void main() {
            // Transform circle center
            vec3 centerWorld = uniformCamTransformation * vec3(x, y, 1.0);
            // Using the vertexOffset to get the offset position for this vertex
            vec3 vertexOffsetWorld = vec3(vertexOffset * radiusScaling * radius, 1.0);

            // final vertex position
            vec3 worldPos = centerWorld + vertexOffsetWorld;

            // Pass texcoords to fragment shader
            gl_Position = vec4(worldPos.xy, 0.0, 1.0);
            vTexcoord = texcoord;
            vPosition = worldPos.xy;
        }
    `;

    private static fragmentShaderCircle = `
        precision mediump float;

        // left-top-right-bottom bounds of the layout element we are drawing to
        uniform vec4 uniformBounds;
        uniform vec4 uniformColor;

        varying vec2 vPosition; // position in world
        varying vec2 vTexcoord; // position from center

        void main() {

            // clipping to layout element
            if (vPosition.x < uniformBounds.x || vPosition.x > uniformBounds.z ||
                vPosition.y > uniformBounds.y || vPosition.y < uniformBounds.w) {
                discard;
            }

            // Compute distance from center (0.5, 0.5)
            vec2 d = vTexcoord - vec2(0.5);
            float distSq = dot(d, d);

            // circle clipping:
            if (distSq > 0.25) {
                discard;
            }

            gl_FragColor = uniformColor;
        }
    `;

    public draw(context: Context, scaleX: Scale, scaleY: Scale, chartLayout: LayoutNode) {
        if (this.x == null || this.y == null || this.radius == null) {
            return;
        }

        const layoutArea = chartLayout?.getArea(context.layoutCache);

        const s = Matrix3x3
            .translate(-scaleX.min, -scaleY.max)
            .scale(layoutArea.width / scaleX.range, -layoutArea.height / scaleY.range);
        const p = context.projectionMatrix;
        const l = layoutArea.toMatrix();

        const m = p.multiply(l.values).multiply(s.values);

        // create and use shader program
        const program = context.useProgram(
            SeriesBubble.IdCircle,
            SeriesBubble.vertexShaderCircle,
            SeriesBubble.fragmentShaderCircle
        );

        // Bind buffers
        context.setArrayBuffer(program, 'vertexOffset', this.vertexOffset);
        context.setArrayBuffer(program, 'texcoord', this.quadTexcoords);

        // Bind instance attributes
        context.setInstanceBuffer(program, 'x', this.x);
        context.setInstanceBuffer(program, 'y', this.y);
        context.setInstanceBuffer(program, 'radius', this.radius);

        // Set uniforms
        context.setUniform(program, 'uniformCamTransformation', m);
        context.setUniform(program, 'uniformColor', this.colorValue);

        context.setUniform(program, 'radiusScaling', new Vector2(
            this.scaling / context.width,
            this.scaling / context.height,
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
