import { Context } from "./context";
import { LayoutNode } from "./layout/layout-node";
import { Scale } from "./scales/scale";

export interface DrawableSeries {
    draw(context: Context, scaleX: Scale, scaleY: Scale, chartLayout: LayoutNode): void;
}
