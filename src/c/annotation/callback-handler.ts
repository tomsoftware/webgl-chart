/** provides a callback that is execute later */
export class CallbackHandler<T> {
    private callbacks: Array<(value: T) => void> = [];

    constructor() {}

    then(callback: (value: T) => void): this {
        this.callbacks.push(callback);
        return this;
    }

    execute(value: T) {
        this.callbacks.forEach(callback => callback(value));
    }
}
