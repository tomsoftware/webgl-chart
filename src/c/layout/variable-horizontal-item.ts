import { LayoutCell } from "./layout-cell";

export class VariableHorizontalItem extends LayoutCell {
    public relativeWidth: number;

    public constructor(relativeWidth: number) {
        super();
        this.relativeWidth = relativeWidth;
    }
}
