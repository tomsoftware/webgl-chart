import type { Context } from "../context";
import type { LayoutArea } from "./layout-area";

export interface LayoutCache {
    getArea(key: string): LayoutArea;
    setArea(key: string, area: LayoutArea): void;
}

export interface LayoutNode {
    /** return the LayoutArea for this node from the given LayoutCache */
    getArea(cache: LayoutCache): LayoutArea;
    /** arange this node and it's childs to the given area */
    calculate(context: Context, cache: LayoutCache, area: LayoutArea): void;
}

export class BaseLayoutNode {
    private static idCounter = 0;
    protected key = 'l' + BaseLayoutNode.idCounter++

    public getArea(cache: LayoutCache): LayoutArea {
        return cache.getArea(this.key);
    }

    protected setArea(cache: LayoutCache, area: LayoutArea): LayoutArea {
        cache.setArea(this.key, area);
        return area;
    }
}
