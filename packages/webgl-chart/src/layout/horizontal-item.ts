import type { Context } from "../context";
import type { IWidthProvider } from "./size-provider";
import { LayoutCell } from "./layout-cell";
import { ScreenUnit, ScreenPosition } from "./screen-position";

export class HorizontalItem extends LayoutCell implements IWidthProvider {
    public providers: IWidthProvider[];

    public constructor(providers: IWidthProvider[]) {
        super();
        this.providers = providers;
    }

    public getWidth(context: Context): ScreenPosition {
        let width = 0;
        for (const provider of this.providers) {
            width += provider.getWidth(context).toNormalized(context);
        }
        return new ScreenPosition(width, ScreenUnit.Normalized);
    }
}
