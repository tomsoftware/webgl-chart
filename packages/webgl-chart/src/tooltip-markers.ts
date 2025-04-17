import { Alignment } from "./alignment";
import { GpuFloatBuffer } from "./buffers/gpu-buffer-float";
import { Color } from "./color";
import { Context } from "./context";
import { LayoutArea } from "./layout/layout-area";
import { LayoutNode } from "./layout/layout-node";
import { Matrix3x3 } from "./matrix-3x3";
import { Scale } from "./scales/scale";
import { GpuLetterText } from "./texture/gpu-letter-text";
import { Vector2 } from "./vector-2";
import { Vector4 } from "./vector-4";

class SeriesInfo {
    public valuesX: GpuFloatBuffer;
    public valuesY: GpuFloatBuffer;
    public scaleX: Scale;
    public scaleY: Scale;
    public color: number[];
    public pointSize: number;

    public constructor(valuesX: GpuFloatBuffer, valuesY: GpuFloatBuffer, scaleX: Scale, scaleY: Scale, color: Color, pointSize: number) {
        this.valuesX = valuesX;
        this.valuesY = valuesY;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.color = color.toArray();
        this.pointSize = pointSize;
    }
}

export class TooltipMarkers {
    private color: Color = Color.black;
    private showVerticalLine = true;
    private series: SeriesInfo[] = [];

    /** this is a unique id to identifies this shader programs */
    private static Id = 'gpu-tooltip-marker';

    /** set the color of tooltip-line */
    public setLineColor(color: Color): TooltipMarkers {
        this.color = color;
        return this;
    }

    /** enables/disables drawing of horizontal or vertical tooltip-line of the current mouse pointer */
    public showLine(vertical: boolean): TooltipMarkers {
        this.showVerticalLine = vertical;
        return this;
    }

    public clearSeries() {
        this.series.length = 0;
    }

    public addSeries(xValues: GpuFloatBuffer, yValues: GpuFloatBuffer, scaleX: Scale, scaleY: Scale, color: Color, pointSize = 8) {
        this.series.push(new SeriesInfo(xValues, yValues, scaleX, scaleY, color, pointSize));
    }

    /** draw the tooltip lines if given position is inside layoutNode */
    public draw(context: Context, position: Vector2 | null | undefined, layoutNode: LayoutNode) {
        if (position == null) {
            return null;
        }

        const chartArea = layoutNode?.getArea(context.layoutCache);
        if (!chartArea.contains(position)) {
            // this mouse is not inside the given area
            return;
        }

        this.clearPointsBuffer();

        // chart LayoutArea translation
        const l = chartArea.toMatrix();
        const p = context.projectionMatrix;

        for (const series of this.series) {
            const scaleX = series.scaleX;
            const scaleY = series.scaleY;

            // scale translation
            const s = Matrix3x3.translate(-scaleX.min, -scaleY.max).scale(chartArea.width / scaleX.range, -chartArea.height / scaleY.range);
            const m = l.multiply(s.values);

            // get the best fitting value from the time-axis
            const timeValue = series.scaleX.valueAt(chartArea.left, position.x, chartArea.right);
            const timeIndex = series.valuesX.findIndex(timeValue);
            if (timeIndex == null) {
                continue;
            }

            const dataTimeValue = series.valuesX.get(timeIndex)[0];
            const dataDataValue = series.valuesY.get(timeIndex)[0];

            const pos = new Vector2(dataTimeValue, dataDataValue);
            const screePos = pos.transform(m);

            if (this.showVerticalLine) {
                context.drawLine(
                    new Vector2(screePos.x, chartArea.top),
                    new Vector2(screePos.x, chartArea.bottom),
                    this.color
                );
            }

            this.addPoint(screePos.x, screePos.y, series.color, series.pointSize);

            const t = new GpuLetterText(dataDataValue.toLocaleString());
            const padding = new Vector2(series.pointSize + 3, series.pointSize + 3);
            t.drawAt(context, screePos, Alignment.rightCenter, padding);

        }

        this.drawPoints(context, chartArea);

    }

    private addPoint(x: number, y: number, color: number[], pointSize: number) {
        this.pointsX.push(x);
        this.pointsY.push(y);
        this.pointsColor.pushRange(color);
        this.pointsSize.push(pointSize);
    }

    private clearPointsBuffer() {
        this.pointsX.clear();
        this.pointsY.clear();
        this.pointsColor.clear();
        this.pointsSize.clear();
    }

    private pointsX = new GpuFloatBuffer(10);
    private pointsY = new GpuFloatBuffer(10);
    private pointsColor = new GpuFloatBuffer(10, 4);
    private pointsSize = new GpuFloatBuffer(10);
    private bbox = new Vector4(0, 0, 1, 1);

    private drawPoints(context: Context, chartArea: LayoutArea) {
        // create and use shader program
        const program = context.useProgram(TooltipMarkers.Id, TooltipMarkers.vertexShaderPoints, TooltipMarkers.fragmentShaderPoints);

        context.setUniform(program, 'uniformCamTransformation', context.projectionMatrix);

        context.setArrayBuffer(program, 'x', this.pointsX);
        context.setArrayBuffer(program, 'y', this.pointsY);
        context.setArrayBuffer(program, 'color', this.pointsColor);
        context.setArrayBuffer(program, 'pointSize', this.pointsSize);

        // set clipping bounds
        const p = context.projectionMatrix;
        const p1 = new Vector2(chartArea.left, chartArea.top).transform(p);
        const p2 = new Vector2(chartArea.right, chartArea.bottom).transform(p);
        context.setUniform(program, 'uniformBounds', this.bbox.set(p1.x, p1.y, p2.x, p2.y));

        context.gl.drawArrays(WebGLRenderingContext.POINTS, 0, this.pointsX.count);
    }

    private static vertexShaderPoints = `
        attribute float x;
        attribute float y;
        attribute vec4 color;
        attribute float pointSize;
        uniform mat3 uniformCamTransformation;
        uniform vec4 uniformBounds; // left-top-right-bottom bounds of the chart
        varying vec4 vColor;

        void main() {
          vec3 position = vec3(x, y, 1.0);
          vec3 transformed = uniformCamTransformation * position;

          if (transformed.x < uniformBounds.x || transformed.x > uniformBounds.z || transformed.y > uniformBounds.y || transformed.y < uniformBounds.w) {
            gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
            return;
          }

          gl_Position = vec4(transformed.xy, 0.0, 1.0);
          gl_PointSize = pointSize;
          vColor = color;
        }`;

      private static fragmentShaderPoints = `
          precision mediump float;
          varying vec4 vColor;

          void main() {
            gl_FragColor = vColor;
          }
        `;

}