export class TextureMapItem {
    public relativeX: number;
    public relativeY: number;
    /** width in pixels of the texture */
    public width: number;
    /** height in pixels of the texture */
    public height: number;
    /** width in % of the texture to the texture-map-size */
    public relativeWidth: number;
    /** height in % of the texture to the texture-map-size */
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
