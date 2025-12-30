import type { Application } from "./application";
import type { Viewport } from "./viewport";

export class Context {
    public application: Application | null = null;
    public viewport: Viewport | null = null;

    public setApplication(application: Application): Context {
        this.application = application;
        return this;
    }

    public setViewport(viewport: Viewport): Context {
        this.viewport = viewport;
        return this;
    }
}