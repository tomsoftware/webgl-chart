export class PausableTimer {
  private start: number;
  private pauseStart: number;
  private paused: number;
  private isPaused: boolean;

  constructor(isPaused: boolean = false) {
    this.start = performance.now();
    this.pauseStart = 0;
    this.paused = 0;
    this.isPaused = isPaused;
  }

  public pause() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.pauseStart = performance.now();
    }
  }

  public resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.paused += performance.now() - this.pauseStart;
      this.pauseStart = 0;
    }
  }

  public reset() {
    this.start = performance.now();
    this.pauseStart = 0;
    this.paused = 0;
  }

  /** returns time in seconds */
  public getTime() {
    if (this.isPaused) {
      return (this.pauseStart - this.start - this.paused) * 0.001;
    }
    return (performance.now() - this.start - this.paused) * 0.001;
  }
}
