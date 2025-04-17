import type { Context } from "../context";
import type { EventDispatcher } from "../event-handler/event-handler";
import type { LayoutArea } from "./layout-area";
import type { LayoutNode } from "./layout-node";
import type { Scale } from "../scales/scale";
import { EventTypes, EventValue } from "../event-handler/event-value";
import { IntersectedLayout } from "./intersected-layout";
import { LayoutCell } from "./layout-cell";
import { VerticalLayout } from "./vertical-layout";
import { HorizontalAxis, HorizontalAxisPosition } from "../scales/horizontal-axis";
import { VerticalAxisPosition } from "../scales/vertical-axis";
import { GpuText } from "../texture/gpu-text";
import { TableRowLayout } from "./horizontal-table-layout";
import { Color } from "../color";
import { BasicYAxisLayout } from "./basic-y-axis-layout";


/** Build up the layout for a chart with x and multiple y axes */
export class BasicChartLayout {
    public readonly yAxis: BasicYAxisLayout[] = [];
    public readonly xAxis: HorizontalAxis;
    public readonly baseCell: LayoutCell;
    public chartCell: LayoutNode = new LayoutCell();
    public xAxisCell: LayoutNode | null = null;
    private eventDispatcher: EventDispatcher;
    private tableRowLayout: TableRowLayout;

    public setXAxisLabel(label: string | null) {
        if (label == null) {
            this.xAxis.label = null;
        }
        else {
            this.xAxis.label?.setText(label);
        }
        
    }

    public get firstYAxis() {
        return this.yAxis[0];
    }

    public get xScale() {
        return this.xAxis.scale;
    }

    public constructor(eventDispatcher: EventDispatcher, baseCell: LayoutCell, xScale: Scale, tableRowLayout: TableRowLayout | null = null) {
        this.eventDispatcher = eventDispatcher;
        this.tableRowLayout = tableRowLayout ?? new TableRowLayout(null);
        this.baseCell = baseCell;
        this.xAxis = new HorizontalAxis(new GpuText('X Axis'), xScale)
            .setBorderColor(Color.platinum)
            .setGridColor(Color.platinum)
            .setPosition(HorizontalAxisPosition.Bottom);

        this.updateLayout();
    }

    public addYScale(scale: Scale, title: string, position?: VerticalAxisPosition): BasicYAxisLayout {
        const newYAxis = new BasicYAxisLayout(this, scale, title);
        if (position != null) {
            newYAxis.axis.setPosition(position)
        }

        this.yAxis.push(newYAxis);

        this.updateLayout();

        return newYAxis;
    }

    /** draw out x and y-axis of the layout */
    public draw(context: Context) {
        // draw x axis
        if (this.xAxisCell != null) {
            this.xAxis.draw(context, this.xAxisCell, this.chartCell);
        }
        
        // draw all y axes
        for (const yAxis of this.yAxis) {
            yAxis.draw(context);
        }

        // write out all pending lines
        context.flush();
    }

    private onWheel = (event: EventValue) => {
        this.xScale.zoom(event.wheelDelta / 600);
    }

    private onPan = (event: EventValue, _layoutNode: LayoutNode, area: LayoutArea) => {
        this.xScale.pan(event.panDeltaX / area.width);
    }

    /** build the current layout from the current config */
    private updateLayout() {
        // remove all existing layout-elements
        this.baseCell.clear();
        this.tableRowLayout.clear();

        // horizontal layout for y axis and chart-data
        const column = this.baseCell.addLayout(this.tableRowLayout);

        // add axis on the left
        for (const yAxis of this.yAxis) {
            if (yAxis.axis.position !== VerticalAxisPosition.Left) {
                continue;
            }
            // add all y-axis
            yAxis.assignTo(column);
        }

        // add the space for the chart-element
        const columnChartCell = column.addRelativeCell(1); // 100% of empty space

        // add axis on the left
        for (const yAxis of this.yAxis) {
            if (yAxis.axis.position !== VerticalAxisPosition.Right) {
                continue;
            }
            // add all y-axis
            yAxis.assignTo(column);
        }

        // vertical layout for x axis and chart-data
        const row = this.baseCell.addLayout(new VerticalLayout());
        const rowChartCell = row.addRelativeCell(1); // 100% of empty space
        const rowAxisCell = row.addFixedCell([this.xAxis]);

        // generate intersected layouts
        this.xAxisCell = this.baseCell.addLayout(new IntersectedLayout(rowAxisCell, columnChartCell));

        for (const yAxis of this.yAxis) {
            yAxis.buildLayout(this.baseCell, rowChartCell);
        }
        this.chartCell = this.baseCell.addLayout(new IntersectedLayout(columnChartCell, rowChartCell));

        // register events
        this.eventDispatcher.on(EventTypes.Wheel, columnChartCell, this.onWheel);
        this.eventDispatcher.on(EventTypes.Pan, columnChartCell, this.onPan);

        for (const yAxis of this.yAxis) {
            yAxis.registerEvents(this.eventDispatcher);
        }
    }
}

