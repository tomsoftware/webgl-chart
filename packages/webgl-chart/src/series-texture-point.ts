import type { LayoutNode, Context, AttributeBuffer, TextureGenerator, TextureMapItem } from '@tomsoftware/webgl-lib';
import { Color, Matrix3x3, Vector4, Vector2, GpuFixBuffer, RectDrawer } from '@tomsoftware/webgl-lib';
import type { DrawableSeries } from './drawable-series';
import type { Scale } from './scales/scale';

/** Renders a series of textured points using a single texture from a texture map */
export class SeriesTexturePoint implements DrawableSeries {
    protected colorValue = new Vector4(1, 1, 1, 1);
    /** the texture generator can be called by the gpu-rendering to provide a image */
    protected textureGenerator: TextureGenerator | null = null;
    protected x: AttributeBuffer;
    protected y: AttributeBuffer;

    // base instance data
    private indexBuffer = new GpuFixBuffer('uint16', 6);
    private vertexOffset = new GpuFixBuffer('vec2', 4);

    /** this is a unique id to identifies this shader programs */
    private static IdTexturePoint = 'gpu-series-texture-point';

    constructor(x: AttributeBuffer, y: AttributeBuffer)
    constructor(x: AttributeBuffer, y: AttributeBuffer) {
        this.x = x;
        this.y = y;

        // add 4 vertex points
        this.vertexOffset.push(-1, -1);
        this.vertexOffset.push(1, -1);
        this.vertexOffset.push(1, 1);
        this.vertexOffset.push(-1, 1);

        // build triangles
        this.indexBuffer.push(0, 1, 2);
        this.indexBuffer.push(0, 2, 3);
    }


    /** Add a texture generator to the drawer's texture map and use the resulting texture for all points. */
    public setTextureGenerator(textureGenerator: TextureGenerator): SeriesTexturePoint {
        this.textureGenerator = textureGenerator;
        return this;
    }

    /** Set the tint color for the textured points. */
    public setColor(color: Color): SeriesTexturePoint {
        this.colorValue.setFromArray(color.toArray());
        return this;
    }

    public get color(): Color {
        return Color.fromFloatArray(this.colorValue.values);
    }

    private static vertexShader = `
        attribute vec2 vertexOffset;
        attribute float x;
        attribute float y;

        uniform mat3 uniformCamTransformation;
        uniform vec2 uniformPointSize;

        varying vec2 o_texcoord;
        varying vec2 o_position;

        void main() {
            vec3 centerWorld = uniformCamTransformation * vec3(x, y, 1.0);
            vec3 offsetWorld = vec3(vertexOffset * uniformPointSize, 0.0);
            vec3 worldPos = centerWorld + offsetWorld;

            gl_Position = vec4(worldPos.xy, 0.0, 1.0);
            o_texcoord = vec2(
                0.0 + (vertexOffset.x + 1.0) * 0.5,
                1.0 - (vertexOffset.y + 1.0) * 0.5
            );


            o_position = worldPos.xy;
        }
    `;

    private static fragmentShader = `
        precision mediump float;

        varying vec2 o_texcoord;
        varying vec2 o_position;

        uniform vec4 uniformColor;
        uniform vec4 uniformBounds;
        uniform sampler2D uniformTexture;
        uniform vec2 uniformTextureLocation;
        uniform vec2 uniformTextureSize;

        void main() {
            if (o_position.x < uniformBounds.x || o_position.x > uniformBounds.z ||
                o_position.y > uniformBounds.y || o_position.y < uniformBounds.w) {
                discard;
            }

            vec2 texCoord = uniformTextureLocation + o_texcoord * uniformTextureSize;
            gl_FragColor = texture2D(uniformTexture, texCoord) * uniformColor;
        }
    `;

    public draw(context: Context, scaleX: Scale, scaleY: Scale, chartLayout: LayoutNode) {
        if (this.textureGenerator == null) {
            return;
        }

        // add texture if not defined / return info about texture
        const textureInfo = context.textureContext.addTexture(this.textureGenerator);
        if (textureInfo == null) {
            // unable to define texture
            return;
        }

        const chartArea = chartLayout?.getArea(context.layoutCache);
        if (chartArea == null) {
            return;
        }

        const pointCount = Math.min(this.x.count, this.y.count);
        if (pointCount <= 0) {
            return;
        }

        const s = Matrix3x3
            .translate(-scaleX.min, -scaleY.max)
            .scale(chartArea.width / scaleX.range, -chartArea.height / scaleY.range);
        const p = context.projectionMatrix;
        const l = chartArea.toMatrix();

        const m = p.multiply(l.values).multiply(s.values);

        const program = context.useProgram(
            SeriesTexturePoint.IdTexturePoint,
            SeriesTexturePoint.vertexShader,
            SeriesTexturePoint.fragmentShader
        );

        context.setArrayBuffer(program, 'vertexOffset', this.vertexOffset);
        context.setInstanceBuffer(program, 'x', this.x);
        context.setInstanceBuffer(program, 'y', this.y);
        context.setElementBuffer(this.indexBuffer);

        context.setUniform(program, 'uniformCamTransformation', m);
        context.setUniform(program, 'uniformPointSize', new Vector2(
            textureInfo.width / context.width,
            textureInfo.height / context.height
        ));
        context.setUniform(program, 'uniformTexture', context.textureContext.textureMap);
        context.setUniform(program, 'uniformTextureLocation', new Vector2(textureInfo.relativeX, textureInfo.relativeY));
        context.setUniform(program, 'uniformTextureSize', new Vector2(textureInfo.relativeWidth, textureInfo.relativeHeight));
        context.setUniform(program, 'uniformColor', this.colorValue);

        // crop outside area
        const p1 = new Vector2(chartArea.left, chartArea.top).transform(p);
        const p2 = new Vector2(chartArea.right, chartArea.bottom).transform(p);
        context.setUniform(program, 'uniformBounds', new Vector4(p1.x, p1.y, p2.x, p2.y));

        context.angleExtension?.drawElementsInstancedANGLE(
            WebGLRenderingContext.TRIANGLES,
            this.indexBuffer.count,
            WebGLRenderingContext.UNSIGNED_SHORT,
            0,
            pointCount
        );
    }
}
