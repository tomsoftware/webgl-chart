import type { A } from "vitest/dist/chunks/environment.LoooBwUu.js";
import type { EventValue } from "../event-handler/event-value";
import type { LayoutArea } from "../layout/layout-area";
import type { LayoutNode } from "../layout/layout-node";

/** Scales are used to scale axis and chart-data */
export class Scale {
    public min: number;
    public max: number;

    public constructor(min: number, max: number) {
        this.min = +min;
        this.max = +max;
    }

    public get range() {
        return (+this.max) - (+this.min);
    }

    private static calcTicksPositive(step: number, start: number, min: number, max: number) {
        let pos =  start;
        const result = [];
        while(pos <= max) {
            if (pos >= min) {
                result.push(pos);
            }  
            pos += step;
        }

        return result;
    }

    private static calcTicksNegative(step: number, start: number, min: number, max: number) {
        let pos = start;
        const result = [];
        while(pos >= max) {
            if (pos <= min) {
                result.push(pos);
            }
            pos += step;
        }

        return result;
    }


    public calculateTicks() {
        const range = this.range;
        if (Math.abs(range) < 0.0000000001) {
            return [this.min];
        }

        let step = 0;
        if (range >= 0) {
            step = Math.pow(10, Math.floor(Math.log10(range)));
        }
        else {
            step = -Math.pow(10, Math.floor(Math.log10(-range)));
        }

        if (range / step < 5) {
            step = step / 5;
        }

        if (range / step < 10) {
            step = step / 2;
        }

        const start = Math.round(this.min / step) * step;
        if (range >= 0) {
            return Scale.calcTicksPositive(step, start, this.min, this.max);
        }
        else {
            return Scale.calcTicksNegative(step, start, this.min, this.max);
        }
    }
    
    public pan(value: number) {
        const panValue = this.range * value;
        this.min -= panValue;
        this.max -= panValue;
    }

    public zoom(value: number) {
        const zoomValue = this.range * value;
        this.min -= zoomValue;
        this.max += zoomValue;
    }
}