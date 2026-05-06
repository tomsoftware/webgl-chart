/** Wrapper class for OffscreenCanvas */
export class Canvas2d {
    private offscreenCan: OffscreenCanvas | null = null;
    private htmlCan: HTMLCanvasElement | null = null;
    private canvas: HTMLCanvasElement | OffscreenCanvas | null = null;
    private context2d: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null = null;
    public devicePixelRatio: number;

    constructor(width: number, height: number, devicePixelRatio: number) {
        this.devicePixelRatio = devicePixelRatio;

        if (typeof OffscreenCanvas !== 'undefined') {
            // https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas#browser_compatibility
            this.offscreenCan = new OffscreenCanvas(width, height);
            this.canvas = this.offscreenCan;
        }
        else {
            // fallback
            if (typeof document === 'undefined') {
                return;
            }

            this.htmlCan = document.createElement('canvas');
            this.htmlCan.width = width;
            this.htmlCan.height = height;
            this.context2d = this.htmlCan.getContext('2d');

            this.canvas = this.htmlCan;
        }

        this.context2d = this.canvas.getContext('2d', {
            alpha: true,
            willReadFrequently: true
        });
    }

    /** returns the internal context. Ensure the size of the canvas with given arguments */
    public getContext2d(minWidth: number = 0, minHeight: number = 0) {
        if (this.canvas == null) {
            return null;
        }

        if ((minWidth > this.canvas.width) || (minHeight > this.canvas.height)) {
            this.canvas.width = Math.max(this.canvas.width, minWidth);
            this.canvas.height = Math.max(this.canvas.height, minHeight);
        }

        return this.context2d;
    }

    /** returns the width of the internal canvas */
    public get width() {
        return this.canvas?.width ?? 0;
    }

    /** returns the height of the internal canvas */
    public get height() {
        return this.canvas?.height ?? 0;
    }

    public dispose() {
        if (this.canvas) {
            this.canvas.width = 0;
            this.canvas.height = 0;
        }

        this.context2d = null;
        this.canvas = null;
        this.htmlCan = null;
        this.offscreenCan = null;
        
    }
}

