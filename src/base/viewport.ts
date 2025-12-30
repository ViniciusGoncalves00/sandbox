import type { Application } from "./application";
import type { Renderer } from "./renderer";

export class Viewport<T extends Application> {
    private renderer: Renderer<T>;
    private container: HTMLElement;

    constructor(
        renderer: Renderer<T>,
        container: HTMLElement,
    ) {
        this.renderer = renderer;
        this.container = container;
        this.renderer.mount(this.container);

        window.addEventListener("resize", this.onResize);
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
        this.renderer.dispose();
    }
}
