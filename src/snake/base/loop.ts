import type { App } from "./app";

export class Loop {
    private static instance: Loop;

    private frameID: number = 0;
    private previousTime: number | null = null;
    private fixedRateMS: number = 33.33;
    private accumulator: number = 0;

    private games = new Set<App>();

    private constructor() {
        this.loop = this.loop.bind(this);
    }

    public static getInstance(): Loop {
        if (!this.instance) {
            this.instance = new Loop();
        }
        return this.instance;
    }

    public add(game: App): void {
        this.games.add(game);
    }

    public remove(game: App): void {
        this.games.delete(game);
    }

    public pause(): void {
        this.previousTime = null;
        cancelAnimationFrame(this.frameID);
    }

    public resume(): void {
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

        for (const game of this.games) {
            game.update(deltaTime);
        }

        while (this.accumulator >= this.fixedRateMS) {
            for (const game of this.games) {
                game.fixedUpdate();
            }
            this.accumulator -= this.fixedRateMS;
        }

        for (const game of this.games) {
            game.lateUpdate();
        }
    }
}
