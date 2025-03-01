import type { Context } from "../context";
import type { LayoutArea } from "../layout/layout-area";
import type { LayoutNode } from "../layout/layout-node";
import { Vector2 } from "../vector-2";
import { EventTypes, EventValue } from "./event-value";

/** callback for received Events. Return true to consume event */
export type EventHandler = (value: EventValue, layoutNode: LayoutNode, layoutArea: LayoutArea) => boolean | void;

class EventListenerInfo {
    public type: EventTypes;
    public callback: EventHandler;
    public layoutNode: LayoutNode;

    public constructor(type: EventTypes, layoutNode: LayoutNode, callback: EventHandler) {
        this.type = type;
        this.layoutNode = layoutNode;
        this.callback = callback;
    }
}

export class EventDispatcher {
    private el: HTMLElement | null = null;
    private listeners: Map<EventHandler, EventListenerInfo> = new Map();
    private eventQueue: EventValue[] = [];

    public bind(el: HTMLElement | null) {
        if (el === this.el) {
            return;
        }

        // remove pending events
        this.unbindEvents(this.el);
        this.el = el;

        // bind new events
        this.bindEvents(el);
    }

    /** register a new event on a layout element */
    public on(type: EventTypes, layoutNode: LayoutNode, callback: EventHandler) {
        this.listeners.set(callback, new EventListenerInfo(type, layoutNode, callback));
    }

    /** dispatch incoming events to the listeners */
    public dispatch(context: Context) {
        if (this.eventQueue.length === 0) {
            return;
        }

        const queue = this.eventQueue;
        this.eventQueue = [];

        for (const event of queue) {
            for (const listener of this.listeners.values()) {
                const area = listener.layoutNode.getArea(context.layoutCache);
                if (area.contains(event.position)) {
                    if (listener.callback(event, listener.layoutNode, area)) {
                        break;
                    }
                }
            }
        }
 
    }

    private bindEvents(el: HTMLElement | null) {
        if (el == null) {
            return;
        }

        el.addEventListener('wheel', this.onMouseWheel, { passive: false } );
        el.addEventListener('mousedown', this.onMouseDown);
        el.addEventListener('mousemove', this.onMouseMove );
        el.addEventListener('mouseup', this.onMouseUp );
    }

    private unbindEvents(el: HTMLElement | null) {
        if (el == null) {
            return;
        }

        el.removeEventListener('wheel', this.onMouseWheel);
        el.removeEventListener('mousedown', this.onMouseDown);
        el.removeEventListener('mousemove', this.onMouseMove );
        el.removeEventListener('mouseup', this.onMouseUp );
    }

    public dispose() {
        const el = this.el;
        this.el = null;

        if (el == null) {
            return;
        }

        this.unbindEvents(el);
    }

    private calcScreenPosition(event: MouseEvent): Vector2 {
        const el = this.el;
        if (el == null) {
            return new Vector2(0, 0);
        }

        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top; 

        const relativeX = x / rect.width; 
        const relativeY = y / rect.width;

        return new Vector2(relativeX, relativeY);
    }

    private onMouseWheel = (event: WheelEvent) : boolean => {
        if (this.listeners.size === 0) {
            return true;
        }

        this.eventQueue.push(
            new EventValue(EventTypes.Wheel, this.calcScreenPosition(event))
                .setWheel(event.deltaY)
        );

        event.preventDefault();
        return false;
    }

    private lastMousePosition: Vector2 | null = null;
    private mouseDownPosition: Vector2 | null = null;

    private onMouseDown = (event: MouseEvent) : void => {
        const pos = this.calcScreenPosition(event);
        this.mouseDownPosition = pos;
        this.lastMousePosition = pos;
    }

    private onMouseUp = (_event: MouseEvent) : void => {
        this.mouseDownPosition = null;;
        this.lastMousePosition = null;
    }


    private onMouseMove = (event: MouseEvent) : void => {
        if (this.listeners.size === 0) {
            return;
        }

        if ((event.buttons !== 1) || (this.mouseDownPosition == null)) {
            return;
        }

        const pos = this.calcScreenPosition(event);
        const lastPos = this.lastMousePosition;
        this.lastMousePosition = pos;

        if (lastPos == null) {
            return;
        }

        // calc delta from last mouse-move event to now
        const delta = pos.sub(lastPos);
        this.eventQueue.push(
            new EventValue(EventTypes.Pan, this.mouseDownPosition)
                .setPan(delta)
        );
    }
}
