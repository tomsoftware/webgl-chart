import { ErrorHandler } from "./error-handler";
import { Context } from "./context";
import { Matrix3x3 } from "./matrix-3x3";

export type RenderCallback = (context: Context) => void;

export class GpuChart {
    private element: HTMLCanvasElement | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private errorHandler = new ErrorHandler();
    private width: number = 1;
    private height: number = 1;
    private devicePixelRatio: number = window.devicePixelRatio;
    private gl: WebGLRenderingContext | null = null;
    private context: Context | null = new Context(window.devicePixelRatio);
    private renderCallback: RenderCallback | null = null;
    // reduce framerate
    private frameDelay: number = 10;
    // time of last frame
    private lastFrame: number = 0;

    /** set max framerate */
    public setMaxFrameRate(fps: number): GpuChart {
        this.frameDelay = 1000 / fps;
        return this;
    }

    /** set max framerate */
    public getMaxFrameRate(): number {
        return 1000 / this.frameDelay;
    }

    /** bind gpu chart to a html a Canvas element */
    public bind(element: HTMLCanvasElement): GpuChart {
        if (element == null) {
            throw new Error('element is null');
        }
        if (element.getContext == null) {
            throw new Error('element is not a canvas element');
        }

        this.element = element;
        this.gl = element.getContext("webgl");
        if (this.gl == null) {
            throw new Error('webgl not supported for the given canvas element');
        }
        
        this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => this.onResize(entries));
        this.resizeObserver.observe( this.element, {box: 'content-box'});

        return this;
    }

    /** dispose gpu chart */
    public dispose(): void {
        this.resizeObserver?.disconnect();
        this.context?.dispose();
        this.context = null;
        this.resizeObserver = null;
        this.element = null;
        
        this.gl = null;
    }

    /**
     * trigger a new rendering. The rendering calls are reduced to a
     * max framerate and syncronized
     **/
    public render(): void {
        requestAnimationFrame((time) => {
            // reduce frame rate
            if (Math.abs(this.lastFrame - time) > this.frameDelay) {
                const startTime = Date.now();
                this.drawScene(time);
                this.lastFrame = time;
                console.log('drawScene: ', Date.now() - startTime, ' ms');
            }
            this.render();
        });
    }

    public setRenderCallback(callback: RenderCallback): void {
        this.renderCallback = callback;
    }

    /** this will draw the chart elements */
    public drawScene(time: number): GpuChart {
        const gl = this.gl;
        if ((gl == null) || (this.context == null)) {
            return this;
        }

        const context = this.context.init(time, this.width, this.height, this.devicePixelRatio, gl);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        if (this.renderCallback) {
            this.renderCallback(context);
        }
        
        context.flush(Matrix3x3.Identity);

        return this;
    }

    /** callback  */
    private onResize(entries: ResizeObserverEntry[]) {
        console.log('onResize');

        for (const entry of entries) {
            if (entry.target !== this.element) {
                continue;
            }

            // see: https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html

            let width;
            let height;
            let dpr = window.devicePixelRatio;
            let dprSupport = false;
            if (entry.devicePixelContentBoxSize) {
              // NOTE: Only this path gives the correct answer
              // The other paths are an imperfect fallback
              // for browsers that don't provide anyway to do this
              width = entry.devicePixelContentBoxSize[0].inlineSize;
              height = entry.devicePixelContentBoxSize[0].blockSize;
              dpr = 1; // it's already in width and height
              dprSupport = true;
            } else if (entry.contentBoxSize) {
              if (Array.isArray(entry.contentBoxSize)) {
                width = entry.contentBoxSize[0].inlineSize;
                height = entry.contentBoxSize[0].blockSize;
              } else {
                // legacy
                const boxSize = entry.contentBoxSize as any;
                width = boxSize.inlineSize;
                height = boxSize.blockSize;
              }
            } else {
              // legacy
              width = entry.contentRect.width;
              height = entry.contentRect.height;
            }
            const displayWidth = Math.round(width * dpr);
            const displayHeight = Math.round(height * dpr);
      
            if (this.width == displayWidth && this.height == displayHeight) {
                // ignore small changes
                continue;
            }

            this.width = displayWidth;
            this.height = displayHeight;
            this.devicePixelRatio = window.devicePixelRatio;

            this.element.width = displayWidth;
            this.element.height = displayHeight;
        }

        this.render();
    }
}
