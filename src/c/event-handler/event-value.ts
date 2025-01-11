import type { Vector2 } from "../vector-2";

export enum EventTypes {
    Unknown,
    Wheel,
    Pan
}

export class EventValue {
    /** type of event */
    public type: EventTypes;
    public wheelDelta: number = 0;
    public panDelta: Vector2 | null = null;
    public position: Vector2;

    public get panDeltaX(): number {
        return this.panDelta?.x ?? 0;
    }

    public get panDeltaY(): number {
        return this.panDelta?.y ?? 0;
    }

    public constructor(type: EventTypes, position: Vector2) {
        this.type = type;
        this.position = position;
    }

    public setWheel(wheelDelta: number): EventValue {
        this.wheelDelta = wheelDelta;
        return this;
    }

    public setPan(delta: Vector2): EventValue {
        this.panDelta = delta;
        return this;
    }
}