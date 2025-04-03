import { Color } from "@tomsoftware/webgl-chart";

export class Generators {

    public static generateSin(t: number): number {
        return 10 + Math.sin(t * 2 * Math.PI) * 10 + Math.random() * 2;
    }

    public static generateSin2(t: number): number {
        return 10 + Math.sin(t * 2 * Math.PI) * 10 + Math.cos(t * 10 * Math.PI) * 2;
    }

    public static generateEKG(t: number): number {
        const noise = Math.random() * 0.5;

        // Define different parts of the EKG waveform
        const base = Math.sin(t * Math.PI * 2);
        const pWave = base * (t % 1 < 0.1 ? 0.5 : 0);
        const qWave = base * (t % 1 >= 0.1 && t % 1 < 0.2 ? -0.5 : 0);
        const rWave = base * (t % 1 >= 0.2 && t % 1 < 0.3 ? 1 : 0);
        const sWave = base * (t % 1 >= 0.3 && t % 1 < 0.4 ? -0.5 : 0);
        const tWave = base * (t % 1 >= 0.4 && t % 1 < 0.6 ? 0.3 : 0);

        return pWave + qWave + rWave + sWave + tWave + noise;
    };

    public static generateIO(t: number): number {
        const rate1 = 0.2;
        const upSample = Math.PI / 100;
        const amp = 10;
        const y1 = amp * Math.sin(2 * Math.PI * rate1 * t) + amp * t;
        const y2 = Math.cos(2 * Math.PI * y1 * upSample);
        return y2 > 0.1 ? 1 : 0;
    }

    private static stableRandom(seed: number): () => number {
        const m = 0x80000000; // 2^31
        const a = 1664525;
        const c = 1013904223;
    
        let state = seed;
    
        return function() {
            state = (a * state + c) % m;
            return state / (m - 1);
        };
    }

    public static generateAnnotations(maxTime: number, count: number): { x: number, color: Color, text: string }[] {
        const list = [];
        const rnd = this.stableRandom(1);
        for (let i = 0; i < count; i+= 1) {
            const x = rnd() * maxTime;
            const type = Math.floor(x * 43231) % 3;

            const color = [Color.red, Color.green, Color.blue][type];
            const text = ['bad', 'good', 'test'][type];
            list.push({x, color, text});
        }

        return list;
    }
}
