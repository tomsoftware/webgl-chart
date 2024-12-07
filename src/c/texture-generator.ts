import type { Context } from "./context";
import type { GpuTexture } from "./gpu-texture";

export interface TextureGenerator {
    computerTexture(context: Context): GpuTexture | null;
}
