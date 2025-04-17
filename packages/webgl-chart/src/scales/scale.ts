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

    /** Maps a given value in a given system to the corresponding internal value */
    public valueAt(minValue: number, value: number, maxValue: number) {
        var relativeValue = (value - minValue) / (maxValue - minValue);
        return this.min + (this.max - this.min) * relativeValue;
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

    private calculateSize(step: number, letterSize: number, ignoreNumberOfLetters: boolean) {
        const num = Math.ceil(this.range / step);

        let maxTickPixelSize: number;
        if (ignoreNumberOfLetters) {
            maxTickPixelSize = letterSize * 2;
        }
        else {
            const test1 = Math.round(this.min / step) * step;
            const test2 = test1 + step;
            maxTickPixelSize = (Math.max(test1.toLocaleString().length, test2.toLocaleString().length) + 2) * letterSize;
        }
        
        return maxTickPixelSize * num;
    }

    /** return a list of numbers that can be used as ticks for the axis */
    public calculateTicks(letterSize: number, scaleMaxSize: number, ignoreNumberOfLetters: boolean): number[] {
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

        while(this.calculateSize(step * 5, letterSize, ignoreNumberOfLetters) > scaleMaxSize) {
            step = step * 5;
        }

        while(this.calculateSize(step * 2, letterSize, ignoreNumberOfLetters) > scaleMaxSize) {
            step = step * 2;
        }

        while(this.calculateSize(step / 5, letterSize, ignoreNumberOfLetters) < scaleMaxSize) {
            step = step / 5;
        }

        while(this.calculateSize(step / 2, letterSize, ignoreNumberOfLetters) < scaleMaxSize) {
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

    public setRange(min: number | null, max: number | null) {
        min = min ?? this.min;
        max = max ?? this.max;

        if (min <= max) {
            this.min = min;
            this.max = max;
        }
        else {
            this.min = max;
            this.max = min;
        }
    }
}