/** defines how to use the data of the buffer */
export class GpuBufferView {
    public readonly vertexAttribDivisor: number;
    public readonly offset: number;

    public constructor(vertexAttribDivisor = 0, offset = 0) {
        this.vertexAttribDivisor = vertexAttribDivisor;
        this.offset = offset;
    }

    public static Default = new GpuBufferView();
    public static InstanceBuffer = new GpuBufferView(1, 0);
}