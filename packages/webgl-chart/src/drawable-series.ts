import type { Context, LayoutNode } from '@tomsoftware/webgl-lib';
import { Scale } from './scales/scale';

export interface DrawableSeries {
    draw(context: Context, scaleX: Scale, scaleY: Scale, chartLayout: LayoutNode): void;
}
