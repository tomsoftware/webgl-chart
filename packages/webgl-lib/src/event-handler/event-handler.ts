type CallbackType<C extends any[] = []>= (...args: C) => boolean | void;

class EventInfo<T, C extends any[] = []> {
    public source: T;
    public callback: CallbackType<C>;

    public constructor(source: T, callback: CallbackType<C>) {
        this.source = source;
        this.callback = callback;
    }
}

export class EventHandler<T, C extends any[] = []> {
    public listeners: Array<EventInfo<T, C>> = [];

    /** Register a listener */
    public add(source: T, callback: CallbackType<C>): void {
        const newEventInfo = new EventInfo(source, callback);
        const oldIndex = this.listeners.findIndex(l => l.callback === callback);
        if (oldIndex >= 0) {
            // This callback was re-added / update so replace the old one
            this.listeners[oldIndex] = newEventInfo;
        }
        else {
            // new listener - add it
            this.listeners.push(newEventInfo);
        }
    }

    /** Remove a listener */
    public remove(callback: CallbackType<C>): void {
        this.listeners = this.listeners.filter(l => l.callback !== callback);
    }
}
