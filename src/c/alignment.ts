export class Alignment {

    public readonly alignX: number;
    public readonly alignY: number;

    public constructor(alignX: number = 0, alignY: number = 0) {
        this.alignX = alignX;
        this.alignY = alignY;
    }

    public leftHorizontal() {
        return new Alignment(0, this.alignY);
    }

    public centerHorizontal() {
        return new Alignment(0.5, this.alignY);
    }
    
    public rightHorizontal() {
        return new Alignment(1, this.alignY);
    }

    public leftVertical() {
        return new Alignment(this.alignX, 0);
    }

    public centerVertical() {
        return new Alignment(this.alignX, 0.5);
    }

    public rightVertical() {
        return new Alignment(this.alignX, 0);
    }

    public static get leftTop(): Alignment {
        return new Alignment(0, 0);
    }

    public static get  centerTop(): Alignment {
        return new Alignment(0.5, 0);
    }

    public static get rightTop(): Alignment {
        return new Alignment(1, 0);
    }

    public static get leftCenter(): Alignment {
        return new Alignment(0, 0.5);
    }

    public static get centerCenter(): Alignment {
        return new Alignment(0.5, 0.5);
    }

    public static get rightCenter(): Alignment {
        return new Alignment(1, 0.5);
    }

    public static get leftBottom(): Alignment {
        return new Alignment(0, 1);
    }

    public static get centerBottom(): Alignment {
        return new Alignment(0.5, 1);
    }

    public static get rightBottom(): Alignment {
        return new Alignment(1, 1);
    }
}
