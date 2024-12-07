import { Color } from "../color";
import type { Context } from "../context";
import type { LayoutArea } from "./layout-area";
import type { LayoutCache } from "./layout-node";

export class LayoutStore implements LayoutCache {
    private cache: Map<string, LayoutArea> = new Map();

    public getArea(key: string): LayoutArea {
        const area = this.cache.get(key);
        if (area == null) {
            throw new Error(`Area with key ${key} not found in layout`);
        }
        return area;
    }

    public setArea(key: string, area: LayoutArea): void {
        this.cache.set(key, area);
    }

    public clear() {
        this.cache.clear();
    }

    public draw(context: Context) {
        let i = 0;
        for (const area of this.cache.values()) {
            const color = Color.byIndex(i);
            context.drawLine(area.p0, area.p1, color);
            context.drawLine(area.p1, area.p2, color);
            context.drawLine(area.p2, area.p3, color);
            context.drawLine(area.p3, area.p0, color);
            i++;
        }
    } 
}
