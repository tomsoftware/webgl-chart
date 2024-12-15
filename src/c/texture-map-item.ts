export class TextureMapItem {
    public relativeX: number;
    public relativeY: number;
    public width: number;
    public height: number;
    public relativeWidth: number;
    public relativeHeight: number;

    constructor(x: number, y: number, width: number, height: number, textureMapWidth: number, textureMapHeight: number) {
        this.relativeX = x / textureMapWidth;
        this.relativeY = y / textureMapHeight;
        this.width = width;
        this.height = height;
        this.relativeWidth = width / textureMapWidth;
        this.relativeHeight = height / textureMapHeight;
    }
}
