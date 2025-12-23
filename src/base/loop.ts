export class Loop {
    private frameID: number = 0;
    private previousTime: number | null = null;
    private accumulator: number = 0;
    private fixedRateMS: number = 33.33;

    private readonly updatables = new Set<(deltaTime: number) => void>();
    private readonly fixedUpdatables = new Set<() => void>();

    public constructor() {
        this.loop = this.loop.bind(this);
    }

    public add(func: (deltaTime: number) => void): void {
        this.updatables.add(func);
    }

    public addFixed(func: () => void): void {
        this.fixedUpdatables.add(func);
    }

    public remove(func: (deltaTime: number) => void): void {
        this.updatables.delete(func);
    }

    public removeFixed(func: () => void): void {
        this.updatables.delete(func);
    }

    public stop(): void {
        this.previousTime = null;
        cancelAnimationFrame(this.frameID);
    }

    public start(): void {
        requestAnimationFrame(this.loop);
    }

    private loop(now: number): void {
        this.frameID = requestAnimationFrame(this.loop);

        if (this.previousTime === null) {
            this.previousTime = now;
            return;
        }

        const deltaTime = now - this.previousTime;
        this.previousTime = now;
        this.accumulator += deltaTime;

        for (const func of this.updatables) {
            func(deltaTime);
        }

        while (this.accumulator >= this.fixedRateMS) {
            for (const func of this.fixedUpdatables) {
                func();
            }
            this.accumulator -= this.fixedRateMS;
        }
    }
}
