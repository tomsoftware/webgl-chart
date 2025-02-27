export class Canvas2d {
    private offscreenCan: OffscreenCanvas | null = null;
    private htmlCan: HTMLCanvasElement | null = null;
    private context2d: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null = null;
    public devicePixelRatio: number;

    constructor(width: number, height: number, devicePixelRatio: number) {
        if (typeof OffscreenCanvas !== 'undefined') {
            // https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas#browser_compatibility
            this.offscreenCan = new OffscreenCanvas(width, height);
            this.context2d = this.offscreenCan.getContext('2d', {
                alpha: true,
                willReadFrequently: true
            });
        }
        else if (typeof OffscreenCanvas !== 'undefined') {
            this.htmlCan = document.createElement('canvas');
            this.context2d = this.htmlCan.getContext('2d');
        }

        this.devicePixelRatio = devicePixelRatio;
    }

    public getContext2d() {
        return this.context2d;
    }

    public dispose() {
        if (this.htmlCan) {
            this.htmlCan.remove();
        }
        this.htmlCan = null;
        this.offscreenCan = null;
        this.context2d = null;
    }
}
