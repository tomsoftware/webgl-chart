export class GpuProgram {
    private gl: WebGLRenderingContext | null = null;
    private shaders: WebGLShader[] = [];
    private program: WebGLProgram | null = null;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
    }

    private createShader(sourceCode: string, type: number): WebGLShader {
        const gl = this.gl;
        if (gl == null) {
            throw 'No open gl context!'
        }

        const shader = gl.createShader(type);
        if (shader == null) {
            throw new Error('Failed to create shader');
        }
        gl.shaderSource(shader, sourceCode);
        gl.compileShader(shader);


        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            throw `Could not compile shader program. \n\n${info} \n\n${sourceCode}`;
        }

        this.shaders.push(shader);

        return shader;
    }

    public deleteShaders() {
        const gl = this.gl;
        if (gl == null) {
            return;
        }

        for (const shader of this.shaders) {
            gl.deleteShader(shader);
        }

        this.shaders = [];
    }

    public deleteProgram() {
        const gl = this.gl;
        if (gl == null) {
            return;
        }

        if (this.program != null) {
            gl.deleteProgram(this.program);
            this.program = null;
        }
    }

    /** dispose gpu program */
    public dispose() {
        this.deleteProgram();
        this.deleteShaders();

        const gl = this.gl;
        this.gl = null;
        if (gl == null) {
            return;
        }
    }

    public use() {
        if (this.gl == null) {
            return;
        }

        this.gl.useProgram(this.program);
    }

    public addVertexShader(sourceCode: string) {
        return this.createShader(sourceCode, WebGLRenderingContext.VERTEX_SHADER);
    }

    public addFragmentShader(sourceCode: string) {
        return this.createShader(sourceCode, WebGLRenderingContext.FRAGMENT_SHADER);
    }

    public getAttribLocation(name: string): GLint | null {
        if ((this.program == null) || (this.gl == null)) {
            return null;
        }

        const index = this.gl.getAttribLocation(this.program, name);
        if (index === -1) {
            throw new Error(`Shader program Attribe not found: ${name}`);
        }
        return index;
    }

    public getUniformLocation(name: string): WebGLUniformLocation | null {
        if ((this.program == null) || (this.gl == null)) {
            return null;
        }

        const index = this.gl.getUniformLocation(this.program, name);
        if (index == null) {
            throw new Error(`Shader program Uniform not found: ${name}`);
        }
        return index;
    }

    public link() {
        this.deleteProgram();
        const gl = this.gl;
        if (gl == null) {
            return;
        }

        const program = gl.createProgram();
        if (program == null) {
            throw new Error('Failed to create program');
        }

        // Attach pre-existing shaders
        for (const shader of this.shaders) {
            gl.attachShader(program, shader);
        }

        gl.linkProgram(program);

        this.program = program;
    }
}
