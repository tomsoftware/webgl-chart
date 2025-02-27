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
import { VerticalAxis } from "../scales/vertical-axis";
import { GpuText } from "../texture/gpu-text";
import { TableRowLayout } from "./horizontal-table-layout";
import { HorizontalLayout } from "./horizontal-layout";
import { Color } from "../color";

export class YAxisLayout {
    public readonly axis: VerticalAxis;
    public columnAxisCell: LayoutCell | null = null;
    public cell: LayoutNode | null = null;
    public chartLayout: BasicChartLayout;
    private titleText: string;


    public get title() {
        return this.titleText;
    }

    public get scale() {
        return this.axis.scale;
    }

    public constructor(layout: BasicChartLayout, scale: Scale, title: string) {
        this.chartLayout = layout;
        this.titleText = title;
        this.axis = new VerticalAxis(
            new GpuText(title)
                .setRotation(90)
        , scale);
    }

    public assignTo(column: TableRowLayout | HorizontalLayout) {
        this.columnAxisCell = column.addFixedCell(this.axis);
    }

    public buildLayout(base: LayoutCell, chartCell: LayoutCell) {
        if (this.columnAxisCell == null) {
            return;
        }
        this.cell = base.addLayout(new IntersectedLayout(this.columnAxisCell, chartCell));
    }

    public draw(context: Context) {
        if (this.cell == null) {
            return;
        }

        this.axis.draw(context, this.cell);
    }

    public registerEvents(eventDispatcher: EventDispatcher) {
        if (this.cell == null) {
            return;
        }

        eventDispatcher.on(EventTypes.Wheel, this.cell, this.onWheel);
        eventDispatcher.on(EventTypes.Pan, this.cell,  this.onPan);
    }

    private onWheel = (event: EventValue) => {
        this.scale.zoom(0.2 * Math.sign(event.wheelDelta));
    }

    private onPan = (event: EventValue, _layoutNode: LayoutNode, area: LayoutArea) => {
        this.scale.pan(- event.panDeltaY / area.height);
    }
}

/** Build up the layout for a chart with x and multiple y axes */
export class BasicChartLayout {
    public readonly yAxis: YAxisLayout[] = [];
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
        this.xAxis  = new HorizontalAxis(new GpuText('X Axis'), xScale)
            .setBorderColor(Color.darkGray)
            .setPosition(HorizontalAxisPosition.Bottom)
            .setGridColor(Color.lightGray);

        this.updateLayout();
    }

    public addYScale(scale: Scale, title: string): YAxisLayout {
        const newYAxis = new YAxisLayout(this, scale, title);
        this.yAxis.push(newYAxis);

        this.updateLayout();

        return newYAxis;
    }

    public draw(context: Context) {
        if (this.xAxisCell != null) {
            this.xAxis.draw(context, this.xAxisCell, this.chartCell);
        }
        
        for (const yAxis of this.yAxis) {
            yAxis.draw(context);
        }
    }

    private onWheel = (event: EventValue) => {
        this.xScale.zoom(0.2 * Math.sign(event.wheelDelta));
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
        for (const yAxis of this.yAxis) {
            // add all y-axis
            yAxis.assignTo(column);
        }

        // add the space for the chart-element
        const columnChartCell = column.addRelativeCell(1); // 100% of empty space

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

