export class Alignment {

    public readonly alignX: number;
    public readonly alignY: number;
    private name: string;

    public constructor(alignX: number = 0, alignY: number = 0, name = 'unknown') {
        this.alignX = alignX;
        this.alignY = alignY;
        this.name = name;
    }

    public toString() {
        return this.name;
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
        return new Alignment(0, 0, 'leftTop');
    }

    public static get centerTop(): Alignment {
        return new Alignment(0.5, 0, 'centerTop');
    }

    public static get rightTop(): Alignment {
        return new Alignment(1, 0, 'rightTop');
    }

    public static get leftCenter(): Alignment {
        return new Alignment(0, 0.5, 'leftCenter');
    }

    public static get centerCenter(): Alignment {
        return new Alignment(0.5, 0.5, 'centerCenter');
    }

    public static get rightCenter(): Alignment {
        return new Alignment(1, 0.5, 'rightCenter');
    }

    public static get leftBottom(): Alignment {
        return new Alignment(0, 1, 'leftBottom');
    }

    public static get centerBottom(): Alignment {
        return new Alignment(0.5, 1, 'centerBottom');
    }

    public static get rightBottom(): Alignment {
        return new Alignment(1, 1, 'rightBottom');
    }

    /** return a array with all alignments */
    public static get list(): Alignment[] {
        return [
            Alignment.leftTop,
            Alignment.leftCenter,
            Alignment.leftBottom,
        
            Alignment.rightTop,
            Alignment.rightCenter,
            Alignment.rightBottom,
        
            Alignment.centerTop,
            Alignment.centerCenter,
            Alignment.centerBottom
          ];
    }
}
