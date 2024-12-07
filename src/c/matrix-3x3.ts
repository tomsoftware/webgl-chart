import type { IUniformValue } from "./unniform";

export class Matrix3x3 implements IUniformValue {
    public values: Float32Array;

    constructor(values?: Float32Array) {
        if (values == null) {
            this.values = new Float32Array(Matrix3x3.IdentityValues);
        }
        else {
            this.values = values;
        }
    }

    public bindUniform(gl: WebGLRenderingContext, variableLoc: WebGLUniformLocation) {
        gl.uniformMatrix3fv(variableLoc, false, this.values);
    }

    private static IdentityValues = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];

    public static Identity = new Matrix3x3(new Float32Array(Matrix3x3.IdentityValues));

    /** extract position from the matrix */
    public getPosition() {
        return {x: this.values[6], y: this.values[7]}
    }

    public setIdentity(): Matrix3x3 {
        this.values = new Float32Array(Matrix3x3.IdentityValues);
        return this;
    }

    public translate(x: number, y: number): Matrix3x3 {
        return Matrix3x3.multiply(Matrix3x3.translate(x, y), this.values);
    }

    public scale(sx: number, sy?: number): Matrix3x3 {
        return Matrix3x3.multiply(Matrix3x3.scale(sx, sy), this.values);
    }

    public rotateDeg(alpha: number): Matrix3x3 {
        return Matrix3x3.multiply(Matrix3x3.rotateRad(alpha * Math.PI / 180), this.values);
    }

    public rotateRad(theta: number): Matrix3x3 {
        return Matrix3x3.multiply(Matrix3x3.rotateRad(theta), this.values);
    }
    
    public multiply(other: Float32Array | number[]) {
        return Matrix3x3.multiply(this, other);
    } 

    public static rotateRad(theta: number): Matrix3x3 {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        return new Matrix3x3(new Float32Array([
            cosTheta, -sinTheta, 0,
            sinTheta, cosTheta, 0,
            0, 0, 1
        ]));
    }

    public static scale(sx: number, sy? : number): Matrix3x3 {
        if (sy == null) {
            sy = sx;
        }

        return new Matrix3x3(new Float32Array([
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1
        ]));
    }


    public static translate(x: number, y: number): Matrix3x3 {
        return new Matrix3x3(new Float32Array([
            1, 0, 0,
            0, 1, 0,
            x, y, 1
        ]));
    }

    public static projection(width: number, height: number): Matrix3x3 {
        // Note: This matrix flips the Y axis so that 0 is at the top.
        return new Matrix3x3(new Float32Array([
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        ]));
        /*
        return new Matrix3x3(new Float32Array([
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        ]));
        */
    }

    public static multiply(m1: Matrix3x3, m2: Float32Array | number[]) {
        // from: https://github.com/mrdoob/three.js/blob/dev/src/math/Matrix3.js
        const result = new Float32Array(9);
        const ae = m1.values;
    
        const a11 = ae[0], a12 = ae[3], a13 = ae[6];
        const a21 = ae[1], a22 = ae[4], a23 = ae[7];
        const a31 = ae[2], a32 = ae[5], a33 = ae[8];

        const b11 = m2[0], b12 = m2[3], b13 = m2[6];
        const b21 = m2[1], b22 = m2[4], b23 = m2[7];
        const b31 = m2[2], b32 = m2[5], b33 = m2[8];

        result[0] = a11 * b11 + a12 * b21 + a13 * b31;
        result[3] = a11 * b12 + a12 * b22 + a13 * b32;
        result[6] = a11 * b13 + a12 * b23 + a13 * b33;

        result[1] = a21 * b11 + a22 * b21 + a23 * b31;
        result[4] = a21 * b12 + a22 * b22 + a23 * b32;
        result[7] = a21 * b13 + a22 * b23 + a23 * b33;

        result[2] = a31 * b11 + a32 * b21 + a33 * b31;
        result[5] = a31 * b12 + a32 * b22 + a33 * b32;
        result[8] = a31 * b13 + a32 * b23 + a33 * b33;

        return new Matrix3x3(result);
    }

}
