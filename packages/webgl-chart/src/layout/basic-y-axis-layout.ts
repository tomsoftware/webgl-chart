import { Color } from "../color";
import { Context } from "../context";
import { EventDispatcher } from "../event-handler/event-handler";
import { EventTypes, EventValue } from "../event-handler/event-value";
import { Scale } from "../scales/scale";
import { VerticalAxis } from "../scales/vertical-axis";
import { GpuText } from "../texture/gpu-text";
import { BasicChartLayout } from "./basic-chart-layout";
import { HorizontalLayout } from "./horizontal-layout";
import { TableRowLayout } from "./horizontal-table-layout";
import { IntersectedLayout } from "./intersected-layout";
import { LayoutArea } from "./layout-area";
import { LayoutCell } from "./layout-cell";
import { LayoutNode } from "./layout-node";

export class YAxisLayout {
    public readonly axis: VerticalAxis;
    public columnAxisCell: LayoutCell | null = null;
    /** the layout element the axis is drawn to */
    public cell: LayoutNode | null = null;
    public chartLayout: BasicChartLayout;

    /** return the title/label text of the axis */
    public get title(): string {
        return this.axis.label?.getText() ?? '';
    }

    /** return the scale used by this axis */
    public get scale(): Scale {
        return this.axis.scale;
    }

    public constructor(layout: BasicChartLayout, scale: Scale, title: string) {
        this.chartLayout = layout;
        this.axis = new VerticalAxis(
            new GpuText(title)
                .setRotation(90)
        , scale);
    }

    /** assign this axis to a given column layout */
    public assignTo(column: TableRowLayout | HorizontalLayout) {
        this.columnAxisCell = column.addFixedCell(this.axis);
    }

    public buildLayout(base: LayoutCell, chartCell: LayoutCell) {
        if (this.columnAxisCell == null) {
            return;
        }
        this.cell = base.addLayout(new IntersectedLayout(this.columnAxisCell, chartCell));
    }

    /** draw the y axis to the screen */
    public draw(context: Context) {
        if (this.cell == null) {
            return;
        }

        this.axis.draw(context, this.cell);
    }

    /** add event handling to the axis */
    public registerEvents(eventDispatcher: EventDispatcher) {
        if (this.cell == null) {
            return;
        }

        eventDispatcher.on(EventTypes.Wheel, this.cell, this.onWheel);
        eventDispatcher.on(EventTypes.Pan, this.cell, this.onPan);
    }

    private onWheel = (event: EventValue) => {
        this.scale.zoom(event.wheelDelta / 600);
    }

    private onPan = (event: EventValue, _layoutNode: LayoutNode, area: LayoutArea) => {
        this.scale.pan(- event.panDeltaY / area.height);
    }

    /** set the color of the tick and label of this axis */
    public setTickColor(color: Color, labelColor?: Color): YAxisLayout {
        this.axis.setTickColor(color);
        this.axis.setBorderColor(color);
        this.axis.label?.setColor(labelColor ?? color);

        return this;
    }
}
