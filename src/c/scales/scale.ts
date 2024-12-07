/** Scales are used to scale axis and chart-data */
export class Scale {
    public min: number;
    public max: number;

    public constructor(min: number, max: number) {
        this.min = min;
        this.max = max;
    }

    public get range() {
        return this.max - this.min;
    }

    public calculateTicks() {
        const range = this.range;
        const step = Math.pow(10, Math.floor(Math.log10(range)));
        let pos = this.min;
        const result = [];
        while(pos <= this.max) {
            result.push(pos);
            pos += step;
        }

        return result;
    }
}
