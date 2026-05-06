import { TextureContext } from "../texture-context";
import { GpuTexture } from "./gpu-texture";
import { TextureGenerator } from "./texture-generator";

export class SvgTextureGenerator implements TextureGenerator {
    public readonly textureKey: string;
    private readonly svg: string;
    private readonly width: number | null;
    private readonly height: number | null;

    private _texture: GpuTexture | null = null;
    private _loading: Promise<void> | null = null;

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
        const blob = new Blob([this.svg], { type: "image/svg+xml" });
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

    /** Returns the precomputed GPU texture (synchronous) */
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
