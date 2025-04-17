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
    // touch distance of last 2-finger gesture
    private initialDistance: number | null = null;
    private lastMousePosition: Vector2 | null = null;
    private lastMouseButtons: number = 0;
    private lastMousePanningPosition: Vector2 | null = null;
    private mouseDownPosition: Vector2 | null = null;

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

        el.style.touchAction ="none";

        el.addEventListener('wheel', this.onMouseWheel, { passive: false } );
        el.addEventListener('mousedown', this.onMouseDown);
        el.addEventListener('mousemove', this.onMouseMove);
        el.addEventListener('mouseup', this.onMouseUp);
        el.addEventListener('mouseleave', this.onMouseleave);

        el.addEventListener('touchstart', this.onTouchStart, { passive: false });
        el.addEventListener('touchmove', this.onTouchMove, { passive: false });
        el.addEventListener('touchend', this.onTouchEnd);
        el.addEventListener('contextmenu', event => event.preventDefault());
    }

    private unbindEvents(el: HTMLElement | null) {
        if (el == null) {
            return;
        }

        el.removeEventListener('wheel', this.onMouseWheel);
        el.removeEventListener('mousedown', this.onMouseDown);
        el.removeEventListener('mousemove', this.onMouseMove);
        el.removeEventListener('mouseup', this.onMouseUp);

        el.removeEventListener('touchstart', this.onTouchStart);
        el.removeEventListener('touchmove', this.onTouchMove);
        el.removeEventListener('touchend', this.onTouchEnd);
    }

    public dispose() {
        const el = this.el;
        this.el = null;

        if (el == null) {
            return;
        }

        this.unbindEvents(el);
    }

    /** Returns the last Mouse position relative to the html element bind to */
    public getMousePosition(): Vector2 | null {
        return this.lastMousePosition;
    }

    /** Returns the last Mouse buttons */
    public getMouseButtons(): number {
        return this.lastMouseButtons;
    }

    private calcScreenPosition(event: MouseEvent | Touch): Vector2 {
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

    /** calculates the distance of two fingers from the TouchList */
    private getDistance(touches: TouchList): number {
        if (touches.length < 2) {
            return 0;
        }

        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** calculate the center-position of of a TouchList */
    private getTouchCenter(touches: TouchList): Vector2 {
        let sum = new Vector2(0, 0);

        if (touches.length < 1) {
            return sum;
        }

        for (const t of touches) {
            sum = sum.add(this.calcScreenPosition(t));
        }

        const center = sum.scale(1.0 / touches.length);
        return center;
    }

    /** set necessary values on panning start */
    private handleStartPanning(event: MouseEvent | Touch) {
        const pos = this.calcScreenPosition(event);
        this.mouseDownPosition = pos;
        this.lastMousePanningPosition = pos;
    }

    /** raise the panning event */
    private handlePanning(event: MouseEvent | Touch) {
        if (this.listeners.size === 0) {
            return;
        }

        if (this.mouseDownPosition == null) {
            return;
        }

        const pos = this.calcScreenPosition(event);
        const lastPos = this.lastMousePanningPosition;
        this.lastMousePanningPosition = pos;

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

    /** reset mouse and touch states */
    private resetAll() {
        this.mouseDownPosition = null;
        this.lastMousePanningPosition = null;
        this.lastMousePosition = null;
        this.initialDistance = null;
        this.lastMouseButtons = 0;
    }

    /** handel touch-start event */
    private onTouchStart = (event: TouchEvent) => {
        event.preventDefault();

        if (event.touches.length === 1) {
            this.handleStartPanning(event.touches[0]);
        }
        else if (event.touches.length === 2) {
            this.initialDistance = this.getDistance(event.touches);
        }
    }

    /** handel touch-move event --> zoom or pan */
    private onTouchMove = (event: TouchEvent) => {
        event.preventDefault();

        if (event.touches.length === 1) {
            // one finger panning
            this.handlePanning(event.touches[0]);
        }
        else if (event.touches.length === 2 && this.initialDistance != null) {
            // two finger zooming
            const currentDistance = this.getDistance(event.touches);
            const scale = currentDistance - this.initialDistance;
    
            if (Math.abs(scale) < 3) {
                return;
            }
            this.initialDistance = currentDistance;

            this.eventQueue.push(
                new EventValue(EventTypes.Wheel, this.getTouchCenter(event.touches))
                    .setWheel(- scale * 2)
            );

        }
    }

    /** handel touch-end event: triggered for every finger that is removed */
    private onTouchEnd = (event: TouchEvent) => {
        event.preventDefault();

        if (event.touches.length < 2) {
            this.resetAll();
        }
    }

    /** handle mouse wheel event --> mouse-zoom */
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

    /** handle mouse-down event --> mouse-pan */
    private onMouseDown = (event: MouseEvent) : void => {
        this.handleStartPanning(event);
        event.preventDefault();
    }

    /** handle mouse-move event --> mouse-pan */
    private onMouseMove = (event: MouseEvent) : void => {
        this.lastMousePosition = this.calcScreenPosition(event);
        this.lastMouseButtons = event.buttons;

        if (!event.buttons) {
            return;
        }

        this.handlePanning(event);
    }

    /** handle mouse-up event --> mouse-pan */
    private onMouseUp = (event: MouseEvent) : void => {
        this.resetAll();
        event.preventDefault();
    }

    /** handle leaving the mouse out of the bonded element */
    private onMouseleave = (event: MouseEvent): void => {
        this.resetAll();
    }
}
