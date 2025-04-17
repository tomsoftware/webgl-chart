import { Color } from "./color";
import { Context } from "./context";
import { LayoutNode } from "./layout/layout-node";
import { Vector2 } from "./vector-2";

export class TooltipLine {
    private color: Color = Color.black;
    private showHorizontalLine = false;
    private showVerticalLine = true;

    /** set the color of tooltip-line */
    public setMouseColor(color: Color): TooltipLine {
        this.color = color;
        return this;
    }

    /** enables/disables drawing of horizontal or vertical tooltip-line of the current mouse pointer */
    public showMouseLines(vertical: boolean, horizontal: boolean): TooltipLine {
        this.showVerticalLine = vertical;
        this.showHorizontalLine = horizontal;
        return this;
    }

    /** draw the tooltip lines if given position is inside layoutNode */
    public draw(context: Context, position: Vector2 | null | undefined, layoutNode: LayoutNode) {
        if (position == null) {
            return null;
        }

        const chartArea = layoutNode?.getArea(context.layoutCache);
        if (!chartArea.contains(position)) {
            // this mouse is not inside the given area
            return;
        }

        if (this.showVerticalLine) {
            context.drawLine(
                new Vector2(position.x, chartArea.top),
                new Vector2(position.x, chartArea.bottom),
                this.color
            );
        }

        if (this.showHorizontalLine) {
            context.drawLine(
                new Vector2(chartArea.left, position.y),
                new Vector2(chartArea.right, position.y),
                this.color
            );
        }

    }

}