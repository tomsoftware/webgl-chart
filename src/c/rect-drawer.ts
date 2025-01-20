import type { Color } from "./color";
import type { Context } from "./context";
import type { Matrix3x3 } from "./matrix-3x3";
import type { LayoutNode } from "./layout/layout-node";
import { Vector4 } from "./vector-4";
import { Vector2 } from "./vector-2";
import { GpuFloatBuffer } from "./buffers/gpu-buffer-float";
import { GpuShortBuffer } from "./buffers/gpu-buffer-short";
import { GpuByteBuffer } from "./buffers/gpu-buffer-byte";
import { TextureMap } from "./texture/texture-map";
import type { TextureMapItem } from "./texture/texture-map-item";

/** defines how to calculate the vertex position in the shader */
export enum DimensionTypes {
    /** default: use the given transformation for this position or size */
    UseTransformation = 0,
    /** use the given layout bounds to calculate this position or size */
    UseBounds = 1,
    /** the given value will be used without transformation in the shader */
    UseAbsolute = 2,
    /** the given value is in pixels */
    UsePixel = 3
}

export type DimensionsType = [DimensionTypes, DimensionTypes, DimensionTypes, DimensionTypes];

/** Draw a batch of rectangles */
export class RectDrawer {
    /** center position (x, y) of the rectangle */
    private rectPos = new GpuFloatBuffer(0, 2);
    /** width and height of the rectangle */
    private rectSize = new GpuFloatBuffer(0, 2);
    /** padding / offset in pixel that is added to vertex position */
    private margin = new GpuFloatBuffer(0, 2);
    /** flag to show if coordinates or rectSize parameter are absolute or relative values */
    private dimensionType = new GpuByteBuffer(0, 4);

    private color = new GpuFloatBuffer(0, 4);
    private vertexOffset = new GpuFloatBuffer(0, 2);
    private stripeWidth = new GpuFloatBuffer(0, 2);
    private borderRadius = new GpuFloatBuffer(0, 1);
    private indexBuffer = new GpuShortBuffer(0, 1);
    private bbox = new Vector4(0, 0, 1, 1);
    private textureLocation = new GpuFloatBuffer(0, 2);
    private textureSize = new GpuFloatBuffer(0, 2);
    
    /** texture-map to store textures to map to the rectangles */
    public textureMap = new TextureMap();

    /** this is a unique id to identifies this shader programs */
    private static Id = 'gpu-rect-drawer';

    /** returns the rectangle position for a given index */
    public getRectPos(index: number) {
        const v = this.rectPos.get(index);
        return new Vector2(v[0], v[1]);
    }

    /** returns the rectangle size for a given index */
    public getRectSize(index: number) {
        const v = this.rectSize.get(index);
        return new Vector2(v[0], v[1]);
    }

    public draw(context: Context, layoutNode: LayoutNode, trafo: Matrix3x3) {
        const layoutArea = layoutNode?.getArea(context.layoutCache);
        const p = context.projectionMatrix;

        // create and use shader program
        const program = context.useProgram(RectDrawer.Id, RectDrawer.vertexShader, RectDrawer.fragmentShader);

        const textureId = this.textureMap.bind(context);
        if (textureId == null) {
            console.error('TextureMapDrawer.draw: Unable to bind texture!');
            return;
        }

        // bind data buffer to attribute
        context.setArrayBuffer(program, 'vertexOffset', this.vertexOffset);

        context.setInstanceBuffer(program, 'rectPos', this.rectPos);
        context.setInstanceBuffer(program, 'rectSize', this.rectSize);
        context.setInstanceBuffer(program, 'dimensionType', this.dimensionType);
        context.setInstanceBuffer(program, 'color', this.color);
        context.setInstanceBuffer(program, 'borderRadius', this.borderRadius);
        context.setInstanceBuffer(program, 'margin', this.margin);
        context.setInstanceBuffer(program, 'stripeWidth', this.stripeWidth);
        context.setInstanceBuffer(program, 'textureLocation', this.textureLocation);
        context.setInstanceBuffer(program, 'textureSize', this.textureSize);
        
        // set texture
        context.setUniform(program, 'uniformTexture', this.textureMap);

        // set element buffer
        context.setElementBuffer(this.indexBuffer);

        // set uniforms
        context.setUniform(program, 'uniformTrafo', trafo);
        context.setUniform(program, 'uniformScreenSize', new Vector2(context.width, context.height));

        // set clipping bounds
        const p1 = new Vector2(layoutArea.left, layoutArea.top).transform(p);
        const p2 = new Vector2(layoutArea.right, layoutArea.bottom).transform(p);
        context.setUniform(program, 'uniformBounds', this.bbox.set(p1.x, p1.y, p2.x, p2.y));

        // draw rectangles
        context.angleExtension?.drawElementsInstancedANGLE(
            WebGLRenderingContext.TRIANGLES,
            this.indexBuffer.count,
            WebGLRenderingContext.UNSIGNED_SHORT,
            0,
            this.rectPos.count
        );
    }

    public addRect2(
        pos: Vector2,
        size: Vector2,
        dimensionType: DimensionsType = [0, 0, 0, 0],
        color1: Color, 
        margin: Vector2 = Vector2.zero,
        stripeWidthX: number = 0, stripeWidthY: number = 0,
        borderRadius: number,
    ): number {
        return this.addRect(
            pos.add(size.scale(0.5)),
            size,
            dimensionType,
            color1,
            margin,
            stripeWidthX, stripeWidthY,
            borderRadius,
        );
    }

    public addRect(
        centerPos: Vector2,
        size: Vector2,
        dimensionType: DimensionsType = [0, 0, 0, 0],
        color1: Color,
        margin: Vector2 = Vector2.zero,
        stripeWidthX: number = 0, stripeWidthY: number = 0,
        borderRadius: number = 0,
        textureInfo: TextureMapItem | null = null
    ): number {

        borderRadius = borderRadius * 0.5;

        let tPose, tSize: Vector2;

        if (textureInfo != null) {
            const relW = textureInfo.relativeWidth;
            const relH = textureInfo.relativeHeight;
    
            tPose = new Vector2(textureInfo.relativeX, textureInfo.relativeY + relH);
            tSize = new Vector2(relW, -relH);
        }
        else {
            // not defined
            tPose = new Vector2(-1, -1);
            tSize = new Vector2(0, 0);
        }

        // add primitive rect data only once
        if (this.vertexOffset.length <= 0) {
            // add 4 vertex-points
            this.vertexOffset.push(-1, -1);
            this.vertexOffset.push(1, -1);
            this.vertexOffset.push(1, 1);
            this.vertexOffset.push(-1, 1);

            // build triangle 1 from the vertex-points
            this.indexBuffer.push(0, 1, 2);
            // build triangle 2 from the vertex-points
            this.indexBuffer.push(0, 2, 3);
        }

        // add instance data
        const instance = this.rectPos.count;

        this.rectPos.push(centerPos.x, centerPos.y);
        this.color.pushRange(color1.toArray());
        this.rectSize.pushRange(size.values);
        this.margin.pushRange(margin.values);
        this.borderRadius.push(borderRadius);
        this.stripeWidth.push(stripeWidthX, stripeWidthY);
        this.dimensionType.pushRange(dimensionType);
        this.textureLocation.pushRange(tPose.values);
        this.textureSize.pushRange(tSize.values);

        return instance;
    }

    public dispose(_gl: WebGLRenderingContext) {
        this.clear();
    }

    public clear() {
        this.rectPos.clear();
        this.color.clear();
        this.vertexOffset.clear();
        this.rectSize.clear();
        this.borderRadius.clear();
        this.stripeWidth.clear();
        this.indexBuffer.clear();
        this.dimensionType.clear();
        this.textureLocation.clear();
        this.textureSize.clear();
        this.margin.clear();
    }

    // https://stackoverflow.com/questions/68233304/how-to-create-a-proper-rounded-rectangle-in-webgl

    private static vertexShader = `
        precision mediump float;

        uniform mat3 uniformTrafo;
         // left-top-right-bottom bounds of the layout element we are drawing to
        uniform vec4 uniformBounds;
        uniform vec2 uniformScreenSize;

        // position of the rectangle: left, top
        attribute vec2 rectPos;
        // size of the rectangle: width, height
        attribute vec2 rectSize;
        // defines if the pos and size are absolute or relative: x, y, width, height
        attribute vec4 dimensionType;
        // indicates the position of this vertex in the rect
        attribute vec2 vertexOffset;

        attribute vec4 color;
        /* additional padding in pixel */
        attribute vec2 margin;
        attribute vec2 stripeWidth;
        attribute float borderRadius;
        /* position of the texture */
        attribute vec2 textureLocation;
        attribute vec2 textureSize;

        varying vec4 o_color;
        varying vec2 o_vertexOffset;
        varying vec2 o_rectSize;
        varying vec2 o_stripeWidth;
        varying float o_borderRadius;
        /* position of the vertex in screen */
        varying vec2 o_position;
        /* position of the texture */
        varying vec2 o_textureLocation;

        vec2 uniformLineThickness = vec2(0.002, 0.005);

        vec2 ratio = vec2(2.0, uniformScreenSize.x / uniformScreenSize.y * 2.0);

        void main(void) {
            //// step 1: calculate real width and height of the rect
            vec3 zeroPos = uniformTrafo * vec3(0.0, 0.0, 1.0);
            vec3 realRectSize = uniformTrafo * vec3(rectSize.xy, 1.0) - zeroPos;

            int dimensionTypeWidth = int(dimensionType.z + 0.5);
            int dimensionTypeHeight = int(dimensionType.w + 0.5);

            ///////
            /// calculate width of rect
            if (dimensionTypeWidth == 1) {
                // use width depending on the bounds
                realRectSize.x = rectSize.x * (uniformBounds.z - uniformBounds.x); // p2.x - p1.x
            }
            else if (dimensionTypeWidth == 2) {
                // use absolute width
                realRectSize.x = rectSize.x * ratio.x;
            }
            else if (dimensionTypeWidth == 3) {
                // use pixels
                realRectSize.x = rectSize.x / uniformScreenSize.x * 2.0;
            }

            ///////
            // calculate height of rect
            if (dimensionTypeHeight == 1) {
                // use height depending on the bounds
                realRectSize.y = rectSize.y * (uniformBounds.w - uniformBounds.y); // p2.y - p1.y
            }
            else if (dimensionTypeHeight == 2) {
                // use absolute height
                realRectSize.y = rectSize.y * ratio.y;
            }
            else if (dimensionTypeHeight == 3) {
                // use pixels
                realRectSize.y = rectSize.y / uniformScreenSize.y * 2.0;
            }
    
            /// step 2: calculate the position of the rect
            vec3 realRectPos = uniformTrafo * vec3(rectPos.xy, 1.0);

            if (dimensionType.x >= 1.0) {
                // use left depending on the bounds
                realRectPos.x = realRectSize.x * 0.5 + (uniformBounds.x + (uniformBounds.z - uniformBounds.x) * rectPos.x);
            }

            if (dimensionType.y >= 1.0) {
                // use top depending on the bounds
                realRectPos.y = realRectSize.y * 0.5 + (uniformBounds.y + (uniformBounds.w - uniformBounds.y) * rectPos.y);
            }

            /// step 3: calculate the position of the vertex depending on texture coordinates

            vec2 realMargin = margin / uniformScreenSize;
            vec2 transformed = vec2(
                realRectPos.x + (realRectSize.x * vertexOffset.x * 0.5) + realMargin.x,
                realRectPos.y + (realRectSize.y * vertexOffset.y * 0.5) + realMargin.y
            );

            gl_Position = vec4(transformed.xy, 0.0, 1.0);

            // path other attributes to fragment shader
            o_color = color;
            o_vertexOffset = vertexOffset;
            o_rectSize = abs(vec2(realRectSize.x * uniformScreenSize.x, realRectSize.y * uniformScreenSize.y));
            o_borderRadius = borderRadius;
            o_stripeWidth = stripeWidth * 2.0;
            o_position = transformed.xy;
            o_textureLocation = textureLocation + (vertexOffset + 1.0) * 0.5 * textureSize;
        }`;

    private static fragmentShader = `
        precision mediump float;

        // left-top-right-bottom bounds of the layout element we are drawing to
        uniform vec4 uniformBounds;

        // Passed in from the vertex shader.
        varying vec4 o_color;
        varying vec2 o_vertexOffset;
        varying vec2 o_rectSize;
        varying vec2 o_stripeWidth;
        varying float o_borderRadius;
        varying vec2 o_position;
        varying vec2 o_textureLocation;

        // texture
        uniform sampler2D uniformTexture;

        void main() {
          /* cropping to layout element */
          if (o_position.x < uniformBounds.x || o_position.x > uniformBounds.z || o_position.y > uniformBounds.y || o_position.y < uniformBounds.w) {
            discard;
          }

          /* dashed line */
          vec2 stripe = mod(o_vertexOffset * o_rectSize / o_stripeWidth, 2.0);
          if ((stripe.x < 1.0) || (stripe.y < 1.0)) {
              discard;
          }

          /* rounded edges */
          if (length(max(abs(o_vertexOffset * o_rectSize) - o_rectSize + o_borderRadius, 0.0)) > o_borderRadius) {
              discard;
          }

          gl_FragColor = (o_textureLocation.y < 0.0) ? o_color : texture2D(uniformTexture, o_textureLocation) * o_color;
        }
    `;
}
