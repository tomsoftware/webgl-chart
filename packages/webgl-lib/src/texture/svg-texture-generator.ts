import { TextureContext } from '../texture-context';
import { GpuTexture } from './gpu-texture';
import { TextureGenerator } from './texture-generator';

/** Generates a GPU texture from an SVG string. This can be used as a source for texture-map */
export class SvgTextureGenerator implements TextureGenerator {
    /** Unique key used to identify the texture */
    public readonly textureKey: string;
    private readonly svg: string;
    /** Optional target width for rasterization (null = auto) */
    private readonly width: number | null;
      /** Optional target height for rasterization (null = auto) */
    private readonly height: number | null;

    /** Cached GPU texture once generated */
    private _texture: GpuTexture | null = null;
    /** Promise used to prevent duplicate loading operations */
    private _loading: Promise<void> | null = null;

    /**
     * Creates a new SVG texture generator.
     * @param textureKey - Unique identifier for the texture
     * @param svg - SVG markup as a string
     * @param width - Optional rasterization width
     * @param height - Optional rasterization height
     */
    constructor(textureKey: string, svg: string, width?: number, height?: number) {
        this.textureKey = textureKey;
        this.svg = svg;
        this.width = width ?? null;
        this.height = height ?? null;
    }

    /**
     * Preloads and rasterizes the SVG into a GPU texture
     * This can be called outside the rendering loop to make the image available
     * If it is not called before/preload it might cause there are some frames without the texture.
     */
    public async preload(context: TextureContext | null): Promise<void> {
        if (this._texture) {
            return;
        }
        if (this._loading) {
            return this._loading;
        }

        if (context == null) {
            return;
        }

        this._loading = this.loadTexture(context);
        await this._loading;
    }

    private async loadTexture(context: TextureContext): Promise<void> {
        const blob = new Blob([this.svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        try {
            const img = new Image();
            img.src = url;
            await img.decode();

            // Determine final rasterization size
            const targetSize = this.calculateSize(img.naturalWidth, img.naturalHeight);

            // Request a 2D context with at least this size
            const ctx = context.getContext2d(targetSize.width, targetSize.height);
            if (!ctx) {
                this._texture = null;
                return;
            }

            // Clear only the used area
            ctx.clearRect(0, 0, targetSize.width, targetSize.height);

            // Draw SVG (stretched or scaled depending on user input)
            ctx.drawImage(img, 0, 0, targetSize.width, targetSize.height);

            // Read only the used area
            const imageData = ctx.getImageData(0, 0, targetSize.width, targetSize.height);
            this._texture = GpuTexture.fromImageData(imageData);

        } finally {
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Calculates the final rasterization size based on user input.
     */
    private calculateSize(svgW: number, svgH: number) {
        const aspect = svgW / svgH;

        // Case 1: width AND height -> stretch
        if (this.width !== null && this.height !== null) {
            return {
                width: this.width,
                height: this.height
            };
        }

        // Case 2: only width -> scale proportionally
        if (this.width !== null) {
            return {
                width: this.width,
                height: Math.round(this.width / aspect)
            };
        }

        // Case 3: only height -> scale proportionally
        if (this.height !== null) {
            return {
                width: Math.round(this.height * aspect),
                height: this.height
            };
        }

        // Case 4: no size provided -> use intrinsic SVG size
        return {
            width: svgW,
            height: svgH
        };
    }

    /** Returns the precomputed GPU texture synchronously
     * If the texture is not yet loaded, this method triggers asynchronous
     * loading but still returns `null` immediately. The texture will become
     * available later once loading completes.
     */
    public computerTexture(context: TextureContext): GpuTexture | null {
        if (this._texture) {
            return this._texture;
        }

        // texture not loaded yet... so load it now async
        //   this may takes some time but we can not wait so the texture might be null now but set later.
        this.preload(context);

        // return the texture if it is ready now
        return this._texture;
    }
}
