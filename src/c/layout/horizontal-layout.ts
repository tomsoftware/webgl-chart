import type { Context } from "../context";
import type { ScreenPosition } from "./screen-position";
import { HorizontalItem, type IWidthProvider } from "./horizontal-item";
import { LayoutArea } from "./layout-area";
import { LayoutCell } from "./layout-cell";
import { BaseLayoutNode, type LayoutCache, type LayoutNode } from "./layout-node";
import { VariableHorizontalItem } from "./variable-horizontal-item";

export class HorizontalLayout extends BaseLayoutNode implements LayoutNode {
    private children: (HorizontalItem | VariableHorizontalItem)[] = [];
    public padding: ScreenPosition | null;

    constructor(padding: ScreenPosition | null = null) {
        super();
        this.padding = padding;
    }

    public addFixedCell(providers: IWidthProvider | IWidthProvider[]): LayoutCell {
        const newCell = new HorizontalItem(Array.isArray(providers) ? providers : [providers]);
        this.children.push(newCell);
        return newCell;
    }

    public addCell(relativeWidth: number): LayoutCell {
        const newCell = new VariableHorizontalItem(relativeWidth);
        this.children.push(newCell);
        return newCell;
    }

    public calculate(context: Context, cache: LayoutCache, area: LayoutArea): void {
        if (this.padding) {
            area = area.shrink(this.padding.toNormalized(context));
        }

        this.setArea(cache, area);

        // get the total width of all children
        const widthCache = new Map<LayoutCell, number>();
        let totalFixedWidth = 0;
        let totalRelativeWidth = 0;

        for (const child of this.children) {
            if (child instanceof HorizontalItem) {
                const w = child.getWidth(context).toNormalized(context);
                widthCache.set(child, w);
                totalFixedWidth += w;
            }
            if (child instanceof VariableHorizontalItem) {
                totalRelativeWidth += child.relativeWidth;
            }
        }

        // width that is left after subtracting fixed width
        const remainingWidth = area.width - totalFixedWidth;
        let posLeft = area.left;

        // us the calculated width to calculate the area for each child
        for (const child of this.children) {
            let w = 0;
            if (child instanceof HorizontalItem) {
                w = widthCache.get(child) ?? 0;
            }
            if (child instanceof VariableHorizontalItem) {
                w = remainingWidth * child.relativeWidth / totalRelativeWidth;
            }

            child.calculate(context, cache, new LayoutArea(posLeft, area.top, w, area.height));
            posLeft += w;
        }
    }
}
