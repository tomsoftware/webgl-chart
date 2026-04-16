export class PausableTimer {
    private callback: (t: number) => void;
    private interval: number;

    private timerId: any = null;
    private running = false;

    private startTime = 0;       // Timestamp, when the timer was last started or resumed
    private accumulated = 0;     // Sum of all elapsed time intervals while the timer was running, excluding the current interval if running

    constructor(func: (t: number) => void, interval: number, startEnabled = false) {
        this.callback = func;
        this.interval = interval;
        if (startEnabled) {
            this.resume();
        }
    }

    public enable(enable: boolean) {
        if (enable && !this.running) {
            this.resume();
        } else if (!enable && this.running) {
            this.pause();
        }
    }

    public resume() {
        this.running = true;
        this.startTime = performance.now();

        this.timerId = setInterval(() => {
            const now = performance.now();
            const t = this.accumulated + (now - this.startTime);
            this.callback(t * 0.001);
        }, this.interval);
    }

    public pause() {
        if (!this.running) {
          return;
        }

        this.running = false;

        const now = performance.now();
        this.accumulated += now - this.startTime;

        clearInterval(this.timerId);
        this.timerId = null;
    }

    public reset() {
        this.accumulated = 0;
        this.startTime = performance.now();
    }

    /** simulate the timer */
    public trigger(count: number) {
        if (count <= 0) {
            return;
        }

        const dt = this.interval;

        for (let i = 0; i < count; i++) {
            this.accumulated += dt;
            const t = this.accumulated * 0.001;
            this.callback(t);
        }
    }

    public dispose() {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
        }
        this.running = false;
        this.timerId = null;
    }
}
