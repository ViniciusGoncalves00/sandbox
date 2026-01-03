import type { Application } from "./application";
import { EventSystem } from "./event-system";
import {
    ApplicationEvent,
    ContextState,
    OnTabChange,
    TimeEvent
} from "./events";
import type { Overlay } from "./overlay";
import { Time } from "./time";
import type { Viewport } from "./viewport";

export class Context<T extends Application> {
    private _application: T | null = null;
    private _overlay: Overlay | null = null;
    private _viewports: Map<string, Viewport<T>> = new Map();

    // private state: ContextState = ContextState.Created;

    public tabBehavior: EventSystem<OnTabChange> = new EventSystem();
    public applicationEvents: EventSystem<ApplicationEvent> = new EventSystem();

    private applicationUnsubscribers: (() => void)[] = [];
    private viewportUnsubscribers: Map<string, (() => void)[]> = new Map();

    // #region APPLICATION
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
                    break;
            }
        });

        return this;
    }

    public application(): T | null {
        return this._application;
    }
    // #endregion

    // #region OVERLAY
    public setOverlay(overlay: Overlay): Context<T> {
        this._overlay = overlay;

        overlay.start   = () => this.applicationEvents.notify(ApplicationEvent.Start);
        overlay.restart = () => this.applicationEvents.notify(ApplicationEvent.Restart);
        overlay.pause   = () => this.applicationEvents.notify(ApplicationEvent.Pause);
        overlay.resume  = () => this.applicationEvents.notify(ApplicationEvent.Resume);
        overlay.quit    = () => this.applicationEvents.notify(ApplicationEvent.Quit);

        this.applicationEvents.subscribe(event => {
            switch (event) {
                case ApplicationEvent.Start:
                case ApplicationEvent.Restart:
                case ApplicationEvent.Resume:
                    this._overlay?.hide();
                    break;

                case ApplicationEvent.Pause:
                case ApplicationEvent.Quit:
                    this._overlay?.show();
                    break;
            }
        });

        return this;
    }

    public overlay(): Overlay | null {
        return this._overlay;
    }
    // #endregion

    // #region VIEWPORTS
    public addViewport(id: string, viewport: Viewport<T>): Context<T> {
        if (this._viewports.has(id)) {
            throw new Error(`Viewport '${id}' already registered`);
        }

        this._viewports.set(id, viewport);

        this.applicationEvents.subscribe(event => {
            switch (event) {
                case ApplicationEvent.Start:
                    // this.subscribeViewport(id, viewport);
                    viewport.start();
                    break;

                case ApplicationEvent.Restart:
                    // this.unsubscribeViewport(id);
                    viewport.dispose();
                    // this.subscribeViewport(id, viewport);
                    viewport.start();
                    break;

                case ApplicationEvent.Quit:
                    // this.unsubscribeViewport(id);
                    viewport.dispose();
                    break;
            }
        });

        return this;
    }

    public removeViewport(id: string): void {
        const viewport = this._viewports.get(id);
        if (!viewport) return;

        // this.unsubscribeViewport(id);
        viewport.dispose();
        this._viewports.delete(id);
    }

    public viewports(): IterableIterator<Viewport<T>> {
        return this._viewports.values();
    }
    // #endregion

    // #region LIFECYCLE
    public init(): Context<T> {
        if (this._overlay) {
            this._overlay.show()
        } else {
            this.applicationEvents.notify(ApplicationEvent.Start);
        }

        return this;
    }

    public awake(): Context<T> {
        this._overlay?.show?.();
        return this;
    }

    public start(): void {
        this._application?.start();
        this.subscribeApplication();
        // this.subscribeAllViewports();
    }

    public pause(): void {
        this.unsubscribeApplication();
        // this.unsubscribeAllViewports();
    }

    public resume(): void {
        this.subscribeApplication();
        // this.subscribeAllViewports();
    }

    public dispose(): void {
        this.unsubscribeApplication();
        // this.unsubscribeAllViewports();

        this._viewports.forEach(v => v.dispose());
        this._viewports.clear();

        this._overlay?.dispose();
    }
    // #endregion

    // #region SUBSCRIPTIONS
    private subscribeApplication(): void {
        if (!this._application) return;

        this.applicationUnsubscribers.push(
            Time.update.subscribe(() => this._application?.update()),
            Time.fixedUpdate.subscribe(() => this._application?.fixedUpdate()),
            Time.lateUpdate.subscribe(() => this._application?.lateUpdate())
        );
    }

    private unsubscribeApplication(): void {
        this.applicationUnsubscribers.forEach(unsub => unsub());
        this.applicationUnsubscribers.length = 0;
    }

    // private subscribeViewport(id: string, viewport: Viewport<T>): void {
    //     const unsubscribers = [
    //         Time.lateUpdate.subscribe(() => viewport.update())
    //     ];

    //     this.viewportUnsubscribers.set(id, unsubscribers);
    // }

    // private unsubscribeViewport(id: string): void {
    //     const subs = this.viewportUnsubscribers.get(id);
    //     subs?.forEach(unsub => unsub());
    //     this.viewportUnsubscribers.delete(id);
    // }

    // private subscribeAllViewports(): void {
    //     this._viewports.forEach((viewport, id) => {
    //         if (!this.viewportUnsubscribers.has(id)) {
    //             this.subscribeViewport(id, viewport);
    //         }
    //     });
    // }

    // private unsubscribeAllViewports(): void {
    //     this.viewportUnsubscribers.forEach(subs =>
    //         subs.forEach(unsub => unsub())
    //     );
    //     this.viewportUnsubscribers.clear();
    // }
    // #endregion
}
