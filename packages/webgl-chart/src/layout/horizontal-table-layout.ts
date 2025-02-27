import type { Context } from "../context";
import type { ScreenPosition } from "./screen-position";
import type { IWidthProvider } from "./size-provider";
import { HorizontalItem } from "./horizontal-item";
import { LayoutArea } from "./layout-area";
import { LayoutCell } from "./layout-cell";
import { BaseLayoutNode, type LayoutCache, type LayoutNode } from "./layout-node";
import { VariableHorizontalItem } from "./variable-horizontal-item";

export class TableRowLayout extends BaseLayoutNode implements LayoutNode {
    public padding: ScreenPosition | null;
    private table: HorizontalTableLayout |null;

    constructor(table: HorizontalTableLayout | null, padding: ScreenPosition | null = null) {
        super();
        this.table = table;
        this.padding = padding;
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

        const tableMaxWidth = this.table?.calculateMaxTotalWidth(context, cache) ?? 0;
        const padding = Math.max(0, tableMaxWidth - totalFixedWidth);
        totalFixedWidth = Math.max(totalFixedWidth, tableMaxWidth);

        // width that is left after subtracting fixed width
        const remainingWidth = area.width - totalFixedWidth;
        let posLeft = area.left + padding;

        // use the calculated width to calculate the area for each child
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

    private children: (HorizontalItem | VariableHorizontalItem)[] = [];

    /* remove all children from this cell */
    public clear() {
        this.children.length = 0;
    }

    /** add a layout cell that is defined by it's children width */
    public addFixedCell(providers: IWidthProvider | IWidthProvider[]): LayoutCell {
        const newCell = new HorizontalItem(Array.isArray(providers) ? providers : [providers]);
        this.children.push(newCell);
        return newCell;
    }

    public addRelativeCell(relativeWidth: number, addToStart: boolean = false): LayoutCell {
        const newCell = new VariableHorizontalItem(relativeWidth);
        if (addToStart) {
            this.children.unshift(newCell);
        } else {
            this.children.push(newCell);
        }
        return newCell;
    }

    public calculateTotalWidth(context: Context): number {
        let totalFixedWidth = 0;

        for (const child of this.children) {
            if (child instanceof HorizontalItem) {
                const w = child.getWidth(context).toNormalized(context);
                totalFixedWidth += w;
            }
        }

        return totalFixedWidth;
    }
}

export class HorizontalTableLayout extends BaseLayoutNode {
    protected rows: TableRowLayout[] = [];

    public addRow(padding: ScreenPosition | null = null) {
        const newRow = new TableRowLayout(this, padding);
        this.rows.push(newRow);
        return newRow;
    }

    public calculateMaxTotalWidth(context: Context, cache: LayoutCache): number {
        
        if (this.hasArea(cache)) {
            // we use the width of the cache to stor the width of the element
            const area = this.getArea(cache);
            return area.width;
        }

        // get size of all cells in the row
        let maxTotalFixedWidth = 0;
        for (const cell of this.rows) {
            const totalFixedWidth = cell.calculateTotalWidth(context);
            maxTotalFixedWidth = Math.max(maxTotalFixedWidth, totalFixedWidth);
        }

        this.setArea(cache, new LayoutArea(0,0,maxTotalFixedWidth, 0));
        
        return maxTotalFixedWidth;
    }
}

