import type { Context } from "../context";
import type { ScreenPosition } from "./screen-position";
import { LayoutArea } from "./layout-area";
import { LayoutCell } from "./layout-cell";
import { BaseLayoutNode, type LayoutCache, type LayoutNode } from "./layout-node";
import { VariableVerticalItem } from "./variable-vertical-item";
import { VerticalItem } from "./vertical-item";
import type { IHeightProvider } from "./size-provider";

export class VerticalLayout extends BaseLayoutNode implements LayoutNode {
    private children: (VerticalItem | VariableVerticalItem)[] = [];
    public padding: ScreenPosition | null;

    constructor(padding: ScreenPosition | null = null) {
        super();
        this.padding = padding;
    }

    /** add a layout cell that is defined by it's children height */
    public addFixedCell(providers: IHeightProvider | IHeightProvider[]): LayoutCell {
        const newCell = new VerticalItem(Array.isArray(providers) ? providers : [providers]);
        this.children.push(newCell);
        return newCell;
    }

    /** add cell with relative height */
    public addRelativeCell(relativeHeight: number, addToStart: boolean = false): LayoutCell {
        const newCell = new VariableVerticalItem(relativeHeight);
        if (addToStart) {
            this.children.unshift(newCell);
        } else {
            this.children.push(newCell);
        }
        return newCell;
    }

    public calculate(context: Context, cache: LayoutCache, area: LayoutArea): void {
        if (this.padding) {
            area = area.adjustMargin(this.padding.toNormalized(context));
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
