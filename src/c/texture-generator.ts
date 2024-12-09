import type { Context } from "./context";
import type { GpuTexture } from "./gpu-texture";

export interface TextureGenerator {
    /** uniqual key to identyfy the texture */
    textureKey: string;
    /** computer the texture and generate a image that can be copied to the gpu */
    computerTexture(context: Context): GpuTexture | null;
}
