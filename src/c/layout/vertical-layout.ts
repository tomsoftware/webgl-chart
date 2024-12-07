import type { Context } from "../context";
import type { ScreenPosition } from "./screen-position";
import { LayoutArea } from "./layout-area";
import { LayoutCell } from "./layout-cell";
import { BaseLayoutNode, type LayoutCache, type LayoutNode } from "./layout-node";
import { VariableVerticalItem } from "./variable-vertical-item";
import { VerticalItem, type IHeightProvider } from "./vertical-item";

export class VerticalLayout extends BaseLayoutNode implements LayoutNode {
    private children: (VerticalItem | VariableVerticalItem)[] = [];
    public padding: ScreenPosition | null;

    constructor(padding: ScreenPosition | null = null) {
        super();
        this.padding = padding;
    }

    public addFixedCell(providers: IHeightProvider | IHeightProvider[]): LayoutCell {
        const newCell = new VerticalItem(Array.isArray(providers) ? providers : [providers]);
        this.children.push(newCell);
        return newCell;
    }

    public addCell(relativeHeight: number): LayoutCell {
        const newCell = new VariableVerticalItem(relativeHeight);
        this.children.push(newCell);
        return newCell;
    }

    public calculate(context: Context, cache: LayoutCache, area: LayoutArea): void {
        if (this.padding) {
            area = area.shrink(this.padding.toNormalized(context));
        }

        this.setArea(cache, area);

        // get the total height of all children
        const heightCache = new Map<LayoutCell, number>();
        let totalFixedHeight = 0;
        let totalRelativeHeight = 0;

        for (const child of this.children) {
            if (child instanceof VerticalItem) {
                const height = child.getHeight(context).toNormalized(context);
                heightCache.set(child, height);
                totalFixedHeight += height;
            }
            if (child instanceof VariableVerticalItem) {
                totalRelativeHeight += child.relativeHeight;
            }
        }

        const remainingHeight = area.height - totalFixedHeight;
        let posTop = area.top;

        // us the calculated height to calculate the area for each child
        for (const child of this.children) {
            let h = 0;
            if (child instanceof VerticalItem) {
                h = heightCache.get(child) ?? 0;
            }
            if (child instanceof VariableVerticalItem) {
                h = remainingHeight * child.relativeHeight / totalRelativeHeight;
            }
            child.calculate(context, cache, new LayoutArea(area.left, posTop, area.width, h));
            posTop += h;
        }
    }
}
