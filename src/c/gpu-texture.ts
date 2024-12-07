export class GpuTexture {
    public readonly width: number;
    public readonly height: number;
    public readonly data: Uint32Array;

    constructor(width: number, height: number, data: Uint32Array) {
        this.width = width;
        this.height = height;
        this.data = data;
    }

    public static fromImageData(data: ImageData): GpuTexture {
        return new GpuTexture(data.width, data.height, new Uint32Array(data.data.buffer));
    }
}
