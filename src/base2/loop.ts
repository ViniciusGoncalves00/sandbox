import type { Loopable } from "./interfaces";

export class Loop {
    private frameID = 0;
    private previousTime: number | null = null;
    private accumulator = 0;
    private fixedRate = 1 / 30;

    private loopables: Map<string, Loopable>;

    public constructor(loopables: Map<string, Loopable>) {
        this.loopables = loopables;
        this.loop = this.loop.bind(this);
    }

    public start(): void {
        requestAnimationFrame(this.loop);
    }

    public stop(): void {
        cancelAnimationFrame(this.frameID);
        this.previousTime = null;
    }

    private loop(now: number): void {
        this.frameID = requestAnimationFrame(this.loop);

        if (this.previousTime === null) {
            this.previousTime = now;
            return;
        }

        const deltaTime = (now - this.previousTime) / 1000;
        this.previousTime = now;
        this.accumulator += deltaTime;

        this.loopables.forEach(l => l.update(deltaTime));

        while (this.accumulator >= this.fixedRate) {
            this.loopables.forEach(l => l.fixedUpdate());
            this.accumulator -= this.fixedRate;
        }
    }
}
