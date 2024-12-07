import type { Context } from "../context";
import type { LayoutArea } from "./layout-area";
import { BaseLayoutNode, type LayoutCache, type LayoutNode } from "./layout-node";

/** can be used to calculate an area that is defined by the intersected area for many LayoutNode */
export class IntersectedLayout extends BaseLayoutNode implements LayoutNode {
    private children: LayoutNode[] = [];

    constructor(...args: LayoutNode[]) {
        super();
        this.children = args;
    }

    public calculate(context: Context, cache: LayoutCache, area: LayoutArea): void {
        let resultArea = area;
        for (const child of this.children) {
            const childArea = child.getArea(context.layoutCache);
            if (childArea == null) {
                throw new Error("cannot calculate IntersectedLayout - wrong order of layout definition!");
            }
            resultArea = resultArea.intersect(child.getArea(context.layoutCache));
        }
        this.setArea(cache, resultArea);
    }

}
