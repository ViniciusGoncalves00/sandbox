import type { Application } from "./application";
import type { Renderer } from "./renderer";

export class Viewport<T extends Application> {
    private renderer: Renderer<T>;
    private container: HTMLElement;

    public constructor(renderer: Renderer<T>, container: HTMLElement) {
        this.renderer = renderer;
        this.container = container;

        window.addEventListener("resize", this.onResize);
        this.container.addEventListener("resize", this.onResize);
    }

    public start(): void {
        this.renderer.start(this.container);
    }

    public update(): void {
        this.renderer.update();
    }

    private onResize = (): void => {
        this.renderer.resize(
            this.container.clientWidth,
            this.container.clientHeight
        );
    };

    public dispose(): void {
        window.removeEventListener("resize", this.onResize);
        this.container.removeEventListener("resize", this.onResize);
        this.renderer.dispose();
    }
}
