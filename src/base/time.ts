import { EventSystem } from "./event-system";
import { TimeEvent, OnTabChange } from "./events";

export class Time {
    public static update: EventSystem<TimeEvent.Update> = new EventSystem();
    public static fixedUpdate: EventSystem<TimeEvent.FixedUpdate> = new EventSystem();
    public static lateUpdate: EventSystem<TimeEvent.LateUpdate> = new EventSystem();

    private static frameID: number = 0;
    private static previousUpdate: number | null = null;
    private static fixedDelta: number = 1 / 50;
    private static accumulator: number = 0;
    private static delta: number = 0;
    
    private static running: boolean = false;
    private static visibilityListenerAttached: boolean = false;
    private static onTabChangeBehavior: OnTabChange = OnTabChange.PauseAndResume;

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

    public static setTabBehavior(behavior: OnTabChange): Time {
        this.onTabChangeBehavior = behavior;
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
        switch (this.onTabChangeBehavior) {
            case OnTabChange.Continue:
                break;
            case OnTabChange.PauseAndResume:
                if (document.hidden) {
                    this.stop();
                } else {
                    this.start();
                }
                break;
            case OnTabChange.Pause:
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
        this.previousUpdate = now;
        this.accumulator += this.delta;

        this.update.notify(TimeEvent.Update);

        while (this.accumulator >= this.fixedDelta) {
            this.accumulator -= this.fixedDelta;
            this.fixedUpdate.notify(TimeEvent.FixedUpdate);
        }

        this.lateUpdate.notify(TimeEvent.LateUpdate);
    };
}