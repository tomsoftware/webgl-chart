import type { Color } from "./color";
import type { Context } from "./context";
import type { LayoutNode } from "./layout/layout-node";

/** Draw a border around a layout cell */
export class LayoutBorder {
    public color: Color;

    constructor(color: Color) {
        this.color = color;
    }
    
    public draw(context: Context, layout: LayoutNode) {
        const area = layout.getArea(context.layoutCache);

        context.drawLine(area.p0, area.p1, this.color);
        context.drawLine(area.p1, area.p2, this.color);
        context.drawLine(area.p2, area.p3, this.color);
        context.drawLine(area.p3, area.p0, this.color);
    }
}
