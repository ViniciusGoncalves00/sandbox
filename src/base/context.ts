import { PerspectiveCamera, WebGPURenderer, type Camera, type Renderer, type Scene } from "three/webgpu";
import { Loop } from "./loop";
import type { ContextParameters } from "./interfaces";
import { generateUUID } from "three/src/math/MathUtils.js";
import { FinishEvent, LoopEvent } from "./events";
import { EventSystem } from "./event-system";
import type { WebGLRenderer } from "three";

export class Context {
    public readonly id: string = generateUUID();
    public renderer!: WebGPURenderer;
    public activeCamera!: Camera;
    public scene!: Scene;
    public canvas!: HTMLCanvasElement;
    public container!: HTMLDivElement;
    
    public readonly gameEvents: EventSystem<FinishEvent> = new EventSystem();
    public readonly loopEvents: EventSystem<LoopEvent> = new EventSystem();
    public readonly loop = new Loop();

    private context!: Context;    
    private render!: () => Promise<void>
    private readonly resizeObserver: ResizeObserver;

    public constructor(params: ContextParameters) {
        this.resizeObserver = new ResizeObserver(() => { this.resize() });
        this.set(params);
    }

    public attachContext(app: Context) {
        this.context = app;
    }

    public set(params: ContextParameters): void {
        if (this.container) this.resizeObserver.unobserve(this.container);
        
        this.renderer = params.renderer;
        this.activeCamera = params.camera;
        this.scene = params.scene;
        this.canvas = params.canvas;
        this.container = params.container;

        this.render = async () => this.renderer.renderAsync(this.scene, this.activeCamera)!;
        this.loop.add(this.render);

        this.resizeObserver.observe(this.container);
    }

    // public destroy(): void {
    //     this.context.destroy();

    //     this.resizeObserver.disconnect();
        
    //     this.loop.remove(this.render);
    //     this.loopEvents.notify(LoopEvent.STOP);
    // }

    public start(): void {
        this.loop.start();
        this.loopEvents.notify(LoopEvent.START);
    }

    public pause(): void {
        this.loop.stop();
        this.loopEvents.notify(LoopEvent.STOP);
    }

    public finish(): void {
        this.loop.remove(this.render);
        this.loop.stop();
        this.renderer.dispose();
        this.scene.traverse(obj => {
            if ((obj as any).geometry) {
                (obj as any).geometry.dispose();
            }
        
            if ((obj as any).material) {
                const material = (obj as any).material;
                if (Array.isArray(material)) {
                    material.forEach(m => m.dispose());
                } else {
                    material.dispose();
                }
            }
        });

        this.scene = null as any;
        this.activeCamera = null as any;
        this.renderer = null as any;
        this.canvas = null as any;
    }

    private resize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        if (width === 0 || height === 0) return;
        
        this.renderer.setSize(width, height);

        if(this.activeCamera instanceof PerspectiveCamera) {
            this.activeCamera.aspect = width / height;
            this.activeCamera.updateProjectionMatrix();
        }
    }
}