import type { Color } from "./color";
import type { TextureGenerator } from "./texture/texture-generator";
import type { IUniformValue } from "./uniform";
import type { LayoutNode } from "./layout/layout-node";
import type { GpuBuffer } from "./buffers/gpu-buffer";
import { Vector2 } from "./vector-2";
import { Canvas2d } from "./canvas-2d";
import { GlBufferTypes, GpuBufferState } from "./buffers/gpu-buffer-state";
import { GpuProgram } from "./gpu-program";
import { TextureMapDrawer } from "./texture/gpu-texture-map-drawer";
import { LayoutArea } from "./layout/layout-area";
import { LayoutStore } from "./layout/layout-cache";
import { LineDrawer } from "./line-drawer";
import { Matrix3x3 } from "./matrix-3x3";
import { TextureMap } from "./texture/texture-map";
import { TextureMapItem } from "./texture/texture-map-item";
import { GpuBufferView } from "./buffers/buffer-view";

/** The context provides functions and data used for one draw iteration */
export class Context {
    public gl!: WebGLRenderingContext;
    public programs = new Map<string, GpuProgram>();
    public buffers = new Map<GpuBuffer, GpuBufferState>();
    private textureDrawer = new TextureMapDrawer(new TextureMap());
    private lineDrawer = new LineDrawer();
    /** width of the canvas we draw to */
    public width: number = 0;
    /** height of the canvas we draw to */
    public height: number = 0;
    /** time of this draw call */
    public time: number = 0;
    private offscreenCanvas2d: Canvas2d;
    public layoutCache = new LayoutStore();
    public projectionMatrix = Matrix3x3.Identity;
    public pixelScale = new Vector2();

    public constructor(devicePixelRatio: number = 1) {
        this.offscreenCanvas2d = new Canvas2d(300, 100, devicePixelRatio);
    }

    /** 
     * provides a offscreen canvas context in 2d that can be used
     *  for temporal generating of textures
     **/
    public get canvas2d() {
        return this.offscreenCanvas2d;
    }

    /** reset the context for a new rendering iteration */
    public init(time: number, width: number, height: number, devicePixelRatio: number, gl: WebGLRenderingContext): Context {
        this.gl = gl;
        this.time = time;
        this.width = width;
        this.height = height;
        this.canvas2d.devicePixelRatio = devicePixelRatio;

        // reset the texture drawer
        this.textureDrawer.clear();
        this.lineDrawer.clear();

        this.projectionMatrix = Matrix3x3.projection(1, height / width);
        this.pixelScale = new Vector2(1 / width, 1 / width);

        // gl.clearColor(0.0, 0.0, 0.0, 0.0);
        // gl.clearStencil(0.0);
        // gl.clearDepth(0.0);

        return this;
    }

    /** converts a given pixel-x value to a screen value */
    public pixelToScreenX(pixelX: number) {
        return pixelX * this.pixelScale.x;
    }

    /** converts a given pixel-y value to a screen value */
    public pixelToScreenY(pixelY: number): number {
        return pixelY * this.pixelScale.y;
    }

    public dispose() {
        for (const program of this.programs.values()) {
            program.dispose();
        }

        if (this.gl != null) {
            for (const buffer of this.buffers.values()) {
                buffer.dispose(this.gl);
            }
            this.textureDrawer.dispose(this.gl);
            this.lineDrawer.dispose(this.gl);
        }

        this.programs.clear();
        this.buffers.clear();
    }

    public setInstanceBuffer(program: GpuProgram, name: string, buffer: GpuBuffer | null, bufferView = GpuBufferView.InstanceBuffer) {
        this.setArrayBuffer(program, name, buffer, bufferView);
    }

    public setArrayBuffer(program: GpuProgram, name: string, buffer: GpuBuffer | null, bufferView = GpuBufferView.Default) {
        if (buffer == null) {
            return null;
        }

        if (!this.buffers.has(buffer)) {
            const state = new GpuBufferState(buffer);
            this.buffers.set(buffer, state);
        }

        const state = this.buffers.get(buffer);
        if (state == null) {
            throw new Error(`Context.setBuffer: buffer can't be created ${name}`);
        }

        // update the data in the gpu
        state.setData(this.gl, GlBufferTypes.ARRAY_BUFFER);

        const variableLoc = program.getAttribLocation(name);
        if (variableLoc == null) {
            throw new Error(`Context.setBuffer: variableLoc is null for ${name}`);
        }

        state.bindBuffer(this.gl, GlBufferTypes.ARRAY_BUFFER);
        state.setVertexAttribPointer(this.gl, variableLoc, this.angleExtension, bufferView);

        return variableLoc;
    }

    public setElementBuffer(buffer: GpuBuffer | null) {
        if (buffer == null) {
            return;
        }

        if (!this.buffers.has(buffer)) {
            const state = new GpuBufferState(buffer);
            this.buffers.set(buffer, state);
        }

        const state = this.buffers.get(buffer);
        if (state == null) {
            throw new Error(`Context.setElementBuffer: buffer can't be created`);
        }

        // update the data in the gpu
        state.setData(this.gl, GlBufferTypes.ELEMENT_ARRAY_BUFFER);

        state.bindBuffer(this.gl, GlBufferTypes.ELEMENT_ARRAY_BUFFER);
    }


    public addTexture(src: TextureGenerator): TextureMapItem | null {
        if (src == null) {
            return null;
        }

        return this.textureDrawer.addTexture(this, src);
    }

    public setUniform(program: GpuProgram, name: string, value: IUniformValue) {
        const gl = this.gl;
        if (gl == null) {
            throw new Error('Context.setUniform: gl is null');
        }

        if (value == null) {
            console.error(`Context.setUniform: value is null for ${name}`);
            return;
        }

        const variableLoc = program.getUniformLocation(name);
        if (variableLoc == null) {
            console.error(`Context.setUniform: variableLoc is null for ${name}`);
            return;
        }

        value.bindUniform(gl, variableLoc);
    }

    private angleExtensionCache: ANGLE_instanced_arrays | null | undefined = undefined;

    /** try to get extension: ANGLE_instanced_arrays */
    public get angleExtension(): ANGLE_instanced_arrays | null {
        if (this.angleExtensionCache === undefined) {
            this.angleExtensionCache = this.gl.getExtension('ANGLE_instanced_arrays');
            if (this.angleExtensionCache == null) {
                console.log('WebGL Extension "ANGLE_instanced_arrays" not available!')
            }
        }
        return this.angleExtensionCache;
    }

    /** calculates the layout */
    public calculateLayout(rootCell: LayoutNode) {
        this.layoutCache.clear();
        const root = new LayoutArea(0, 0, 1, this.height / this.width);

        rootCell.calculate(this, this.layoutCache, root);
    }

    public drawLine(p1: Vector2, p2: Vector2, color: Color): void {
        return this.lineDrawer.addLine(p1, p2, color);
    }

    public drawTexture(textureInfo: TextureMapItem, transformation: Matrix3x3, color: Color) {
        this.textureDrawer.add(transformation, textureInfo, color);
    }

    /**
     * texture drawing are cached and batched
     * this will write out all textures */
    public flushTextures(transformation?: Matrix3x3) {
        let m = this.projectionMatrix;
        if (transformation != null) {
            m = m.multiply(transformation.values);
        }

        this.textureDrawer.draw(this, m);
        this.textureDrawer.clear();
    }

    /**
     * line drawing are cached and batched
     * this will write out all lines */
    public flushLines(transformation?: Matrix3x3) {
        let m = this.projectionMatrix;
        if (transformation != null) {
            m = m.multiply(transformation.values);
        }

        this.lineDrawer.draw(this, m);
        this.lineDrawer.clear();
    }

    /** flush all pending batches */
    public flush(transformation?: Matrix3x3) {
        this.flushTextures(transformation);
        this.flushLines(transformation);
}

    /** create and use a gl-shader-program */
    public useProgram(id: string, vertexShader: string, fragmentShader: string) {
        const gl = this.gl;
        if (gl == null) {
            throw new Error('Context.useProgram: gl is null');
        }

        let program = this.programs.get(id);
        if (program == null) {
            program = new GpuProgram(gl);
            program.addVertexShader(vertexShader);
            program.addFragmentShader(fragmentShader);
            program.link();

            this.programs.set(id, program);
        }

        program.use();

        return program;
    }

    /** 
     * Return a html of the texture buffer used by the texture map
     * - mainly for debugging purposes 
     **/
    public exportTextureHtmlImage() {
        return this.textureDrawer.exportToHtmlImage();
    }
}
