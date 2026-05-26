import type { Vector2 } from '../vector-2';

export enum EventTypes {
    Unknown = "",
    Wheel = "Wheel",
    Pan = "Pan",
    MouseMove = "MouseMove"
}

export class EventValue {
    /** type of event */
    public type: EventTypes;
    /** x/y position of the event in pixels relative to the top-left corner of the canvas */
    public position: Vector2;
    /** wheel delta for wheel events */
    public wheelDelta: number = 0;
    /** pan delta for pan events */
    public panDelta: Vector2 | null = null;

    /** returns the x-delta of a pan event, or 0 if not a pan event */
    public get panDeltaX(): number {
        return this.panDelta?.x ?? 0;
    }

    /** returns the y-delta of a pan event, or 0 if not a pan event */
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
