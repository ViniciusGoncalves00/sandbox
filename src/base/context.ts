import type { Application } from "./application";
import type { Viewport } from "./viewport";

export class Context<T extends Application> {
    public application: Application | null = null;
    public viewport: Viewport<T> | null = null;

    public setApplication(application: Application): Context<T> {
        this.application = application;
        return this;
    }

    public setViewport(viewport: Viewport<T>): Context<T> {
        this.viewport = viewport;
        return this;
    }
}