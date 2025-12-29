import { EventSystem } from "./event-system";
import { LoopEvent, TabBehavior } from "./events";

export class Time {
    public static events: EventSystem<LoopEvent> = new EventSystem();

    private static frameID: number = 0;
    private static previousUpdate: number | null = null;
    private static fixedDelta: number = 1 / 50;
    private static accumulator: number = 0;
    private static delta: number = 0;
    
    private static running: boolean = false;
    private static visibilityListenerAttached: boolean = false;
    private static tabBehavior: TabBehavior = TabBehavior.PauseAndResume;

    private constructor() {}

    public static start(): void {
        if (this.running) return;

        this.running = true;
        this.previousUpdate = null;

        this.attachVisibilityListener();
        requestAnimationFrame(this.loop);
    }

    public static stop(): void {
        if (!this.running) return;

        this.running = false;
        cancelAnimationFrame(this.frameID);
    }

    public static setFixedRate(hz: number): Time {
        this.fixedDelta = 1 / hz;
        return this;
    }

    public static setTabBehavior(behavior: TabBehavior): Time {
        this.tabBehavior = behavior;
        this.attachVisibilityListener();
        return this;
    }

    public static deltaTime(): number {
        return this.delta;
    }

    public static reset(): void {
        this.previousUpdate = null;
        this.accumulator = 0;
    }

    private static attachVisibilityListener(): void {
        if (this.visibilityListenerAttached) return;

        document.addEventListener("visibilitychange", this.onVisibilityChange);
        this.visibilityListenerAttached = true;
    }

    private static onVisibilityChange = (): void => {
        switch (this.tabBehavior) {
            case TabBehavior.Continue:
                break;
            case TabBehavior.PauseAndResume:
                if (document.hidden) {
                    this.stop();
                } else {
                    this.start();
                }
                break;
            case TabBehavior.Pause:
                if (document.hidden) {
                    this.stop();
                }
                break;
        }
    };

    private static loop = (now: number): void => {
        if (!this.running) return;

        this.frameID = requestAnimationFrame(this.loop);

        if (this.previousUpdate === null) {
            this.previousUpdate = now;
            return;
        }

        this.delta = (now - this.previousUpdate) / 1000;
        console.log(this.delta)
        this.previousUpdate = now;
        this.accumulator += this.delta;

        this.events.notify(LoopEvent.Update);

        while (this.accumulator >= this.fixedDelta) {
            this.accumulator -= this.fixedDelta;
            this.events.notify(LoopEvent.FixedUpdate);
        }
    };
}