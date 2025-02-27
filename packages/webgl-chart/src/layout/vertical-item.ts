import type { Context } from "../context";
import type { IHeightProvider } from "./size-provider";
import { LayoutCell } from "./layout-cell";
import { ScreenUnit, ScreenPosition } from "./screen-position";

export class VerticalItem extends LayoutCell implements IHeightProvider {
    public providers: IHeightProvider[];

    public constructor(providers: IHeightProvider[]) {
        super();
        this.providers = providers;
    }

    public getHeight(context: Context): ScreenPosition {
        let height = 0;
        for (const provider of this.providers) {
            height += provider.getHeight(context).toNormalized(context);
        }
        return new ScreenPosition(height, ScreenUnit.Normalized);
    }
}