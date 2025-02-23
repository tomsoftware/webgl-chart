import { LayoutCell } from "./layout-cell";

export class VariableVerticalItem extends LayoutCell {
    public relativeHeight: number;

    public constructor(relativeHeight: number) {
        super();
        this.relativeHeight = relativeHeight;
    }
}