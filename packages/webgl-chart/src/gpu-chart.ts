import { Context } from "./context";
import { Matrix3x3 } from "./matrix-3x3";

export type RenderCallback = (context: Context) => void;

export class GpuChart {
    private element: HTMLCanvasElement | null = null;
    private gl: WebGLRenderingContext | null = null;
    private context: Context | null = new Context(1);
    private renderCallback: RenderCallback | null = null;
    // reduce framerate
    private frameDelay: number = 10;
    // time of last frame
    private lastFrame: number = 0;
    private previousRenderTimestamp = 0;
    // indicate that the chart is disposed
    private disposed = false;
    private boundResizeCallback: (() => void) | null = null;

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
        this.gl = element.getContext('webgl');
        if (this.gl == null) {
            throw new Error('webgl not supported for the given canvas element');
        }

        this.boundResizeCallback = () => this.onResize();
        window.addEventListener('resize', this.boundResizeCallback);
        window.addEventListener('orientationchange', this.boundResizeCallback);
        element.addEventListener('resize', this.boundResizeCallback);

        return this;
    }


    /** dispose gpu chart */
    public dispose(): void {
        this.disposed = true;
        this.context?.dispose();
        this.context = null;
        if (this.boundResizeCallback != null) {
            window.removeEventListener('resize', this.boundResizeCallback);
            window.removeEventListener('orientationchange', this.boundResizeCallback);
            this.element?.removeEventListener('resize', this.boundResizeCallback);
        }
        this.boundResizeCallback = null;
        this.element = null;
        
        this.gl = null;
    }


    private renderInternal = (time: number) => {
        if (this.disposed) {
            return;
        }

        if (this.previousRenderTimestamp == time) {
            return;
        }

        if (this.previousRenderTimestamp !== 0) {
            console.log('drawScene: '+ Math.round(time - this.previousRenderTimestamp) +' ms');
            this.previousRenderTimestamp = 0;
        }

        // reduce frame rate
        if (Math.abs(this.lastFrame - time) > this.frameDelay) {
            this.previousRenderTimestamp = time;
            this.drawScene(time);
            this.lastFrame = time;
        }

        // call for the next frame
        requestAnimationFrame(this.renderInternal);
    }

    /**
     * trigger a new rendering. The rendering calls are reduced to a
     * max framerate and synchronized
     **/
    public render(): void {
        requestAnimationFrame(this.renderInternal);
    }

    /** set the function that is called when ever the chart needs to be redrawn */
    public setRenderCallback(callback: RenderCallback): void {
        this.renderCallback = callback;
    }

    private updateSize(element: HTMLCanvasElement) {
        const contentSize = GpuChart.getElementContentWidth(element);
        element.width = Math.floor(contentSize.width);
        element.height = Math.floor(contentSize.height);
        return contentSize;
    }

    /** this will draw the chart elements */
    public drawScene(time: number): GpuChart {
        const gl = this.gl;
        if ((gl == null) || (this.context == null) || (this.element == null)) {
            return this;
        }

        const contentSize = this.updateSize(this.element);

        const context = this.context.init(time, contentSize.width, contentSize.height, contentSize.devicePixelRatio, gl);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        if (this.renderCallback) {
            this.renderCallback(context);
        }
        
        context.flush(Matrix3x3.Identity);

        return this;
    }

    private static getElementContentWidth(element: HTMLElement) {
        const rect = element.getBoundingClientRect();

        //const styles = window.getComputedStyle(element);
        //const paddingWidth = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
        //const paddingHeight = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
        return {
            width: Math.floor(rect.right - rect.left),
            height: Math.floor(rect.bottom - rect.top),
            devicePixelRatio: window.devicePixelRatio
        };
      }

    /** event listener callback for resize of canvas */
    private onResize() {
        console.log('onResize');

        if (this.element == null) {
            return;
        }
        
        this.render();
    }
}
