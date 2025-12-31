import type { Application } from "./application";
import { EventSystem } from "./event-system";
import { ApplicationEvent, ContextState, OnTabChange, TimeEvent } from "./events";
import type { Overlay } from "./overlay";
import { Time } from "./time";
import type { Viewport } from "./viewport";

export class Context<T extends Application> {
    private _application: T | null = null;
    private _viewport: Viewport<T> | null = null;
    private _overlay: Overlay | null = null;
        
    private state: ContextState = ContextState.Created;

    public tabBehavior: EventSystem<OnTabChange> = new EventSystem();
    public timeEvents: EventSystem<TimeEvent> = new EventSystem();
    public applicationEvents: EventSystem<ApplicationEvent> = new EventSystem();
    
    private applicationUnsubscribers: (() => void)[] = [];
    private viewportUnsubscribers: (() => void)[] = [];

    public setApplication(application: T): Context<T> {
        this._application = application;

        this.applicationEvents.subscribe(event => {
            switch (event) {
                case ApplicationEvent.Start:
                    if (!this._application?.wasStarted()) {
                        this._application?.awake();
                        this._application?.start();
                        this.subscribeApplication();
                    }
                    break;
                case ApplicationEvent.Restart:
                    this._application?.reset();
                    break;
                case ApplicationEvent.Pause:
                    this.unsubscribeApplication();
                    break;
                case ApplicationEvent.Resume:
                    this.subscribeApplication();
                    break;
                case ApplicationEvent.Quit:
                    this.unsubscribeApplication();
                    this._application?.awake();
                default:
                    break;
            }
        })

        return this;
    }

    public setViewport(viewport: Viewport<T>): Context<T> {
        this._viewport = viewport;
        
        this.applicationEvents.subscribe(event => {
            switch (event) {
                case ApplicationEvent.Start:
                    this.subscribeViewport();
                    this._viewport?.start();
                    break;
                case ApplicationEvent.Restart:
                    this._viewport?.dispose();
                    this._viewport?.start();
                    break;
                case ApplicationEvent.Quit:
                    this.unsubscribeViewport();
                    this._viewport?.dispose();
                default:
                    break;
            }
        });

        return this;
    }

    public setOverlay(overlay: Overlay): Context<T> {
        this._overlay = overlay;

        overlay.start = () => this.applicationEvents.notify(ApplicationEvent.Start);
        overlay.restart = () => this.applicationEvents.notify(ApplicationEvent.Restart);
        overlay.pause = () => this.applicationEvents.notify(ApplicationEvent.Pause);
        overlay.resume = () => this.applicationEvents.notify(ApplicationEvent.Resume);
        overlay.quit = () => this.applicationEvents.notify(ApplicationEvent.Quit);

        this.applicationEvents.subscribe(event => {
            switch (event) {
                case ApplicationEvent.Start:
                    this._overlay?.hide();
                    break;
                case ApplicationEvent.Restart:
                    this._overlay?.hide();
                    break;
                case ApplicationEvent.Quit:
                    this._overlay?.show();
                case ApplicationEvent.Pause:
                    this._overlay?.show();
                    break;
                case ApplicationEvent.Resume:
                    this._overlay?.hide();
                    break;
                default:
                    break;
            }
        });

        return this;
    }

    public application(): T | null { return this._application; }
    public viewport(): Viewport<T> | null { return this._viewport; }
    public overlay(): Overlay | null { return this._overlay; }

    public awake(): Context<T> {
        if (this.state !== ContextState.Created) return this;

        // this._application?.awake();
        this._overlay?.build(document.body);
        this._overlay?.show?.();

        this.state = ContextState.Builded;
        return this;
    }

    public start(): void {
        if (this.state !== ContextState.Builded) return;

        this._application?.start();

        this.applicationUnsubscribers.push(
            Time.update.subscribe(() => this._application?.update()),
            Time.fixedUpdate.subscribe(() => this._application?.fixedUpdate()),
            Time.lateUpdate.subscribe(() => this._application?.lateUpdate()),
            Time.lateUpdate.subscribe(() => this._viewport?.update())
        );

        this.state = ContextState.Running;
    }

    public pause(): void {
        if (this.state !== ContextState.Running) return;

        this.unsubscribeApplication();
        this.state = ContextState.Paused;
    }

    public resume(): void {
        if (this.state !== ContextState.Paused) return;
        this.start();
    }

    public dispose(): void {
        this.unsubscribeApplication();
        this._viewport?.dispose();
        this._overlay?.dispose();
        this.state = ContextState.Disposed;
    }

    private subscribeApplication(): void {
        this.applicationUnsubscribers.push(
            Time.update.subscribe(() => this._application?.update()),
            Time.fixedUpdate.subscribe(() => this._application?.fixedUpdate()),
            Time.lateUpdate.subscribe(() => this._application?.lateUpdate()),
        );
    }

    private subscribeViewport(): void {
        this.viewportUnsubscribers.push(
            Time.lateUpdate.subscribe(() => this._viewport?.update())
        );
    }

    private unsubscribeApplication(): void {
        this.applicationUnsubscribers.forEach(unsubscribe => unsubscribe());
        this.applicationUnsubscribers.length = 0;
    }

    private unsubscribeViewport(): void {
        this.viewportUnsubscribers.forEach(unsubscribe => unsubscribe());
        this.viewportUnsubscribers.length = 0;
    }
}