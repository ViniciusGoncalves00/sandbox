import type { Camera, Scene, Renderer } from "three/webgpu";

export interface ViewParameters {
    renderer: Renderer;
    camera: Camera;
    scene: Scene;
    canvas: HTMLCanvasElement;
}

export class App {
    protected readonly views: ViewParameters[] = [];

    public constructor(view: ViewParameters) {
        this.views.push(view);
    }

    public add(view: ViewParameters): void {
        this.views.push(view);
    }

    public remove(index: number): void {
        this.views.splice(index, 1);
    }

    public update(deltaTime: number): void {
        for (const view of this.views) {
            view.renderer.renderAsync(view.scene, view.camera)
        }
    }

    public fixedUpdate(): void {};
    public lateUpdate(): void {};
    public destroy(): void {};
}