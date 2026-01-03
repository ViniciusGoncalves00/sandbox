import type { Application } from "./application";
import type { Renderer } from "./renderer";

export class Viewport<T extends Application> {
    private renderer: Renderer<T>;
    private parent: HTMLElement;
    protected wrapper: HTMLElement;
    protected content: HTMLElement;
    protected name: HTMLElement | undefined;

    private resizeObserver?: ResizeObserver;

    public constructor(renderer: Renderer<T>, parent: HTMLElement, name?: string) {
        this.renderer = renderer;
        this.parent = parent;

        this.wrapper = document.createElement("div");
        this.wrapper.classList = "w-full h-full flex flex-col items-center justify-center space-y-2";
        this.parent.appendChild(this.wrapper);
        
        if (name) {
            this.name = document.createElement("div");
            this.name.classList = "h-4 flex items-center justify-center text-white";
            this.name.textContent = name;
            this.wrapper.appendChild(this.name);
        }

        this.content = document.createElement("div");
        this.content.classList = "w-full h-full min-h-0 min-w-0";
        this.wrapper.appendChild(this.content);

        this.hide();
    }

    public start(): Viewport<T> {
        this.show();
        this.renderer.start(this.content);
        return this;
    }

    public update(): Viewport<T> {
        this.renderer.update();
        return this;
    }

    public show(): Viewport<T> {
        this.wrapper.classList.remove("hidden");

        this.resizeObserver = new ResizeObserver(() => {
            this.onResize();
        });
        this.resizeObserver.observe(this.content);

        return this;
    }

    public hide(): Viewport<T> {
        this.resizeObserver?.disconnect();
        this.resizeObserver = undefined;

        this.wrapper.classList.add("hidden");
        return this;
    }

    public dispose(): Viewport<T> {
        this.resizeObserver?.disconnect();
        this.resizeObserver = undefined;
        this.renderer.dispose();
        this.parent.removeChild(this.wrapper);
        return this;
    }

    private onResize = (): void => {
        this.renderer.resize(
            this.content.clientWidth,
            this.content.clientHeight
        );
    };
}
