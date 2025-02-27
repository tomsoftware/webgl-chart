import type { Context } from "../context";
import type { ScreenPosition } from "./screen-position";

export interface IWidthProvider {
    getWidth(context: Context): ScreenPosition;
}

export interface IHeightProvider {
    getHeight(context: Context): ScreenPosition;
}
