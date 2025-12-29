import * as THREE from "three/webgpu";
import type { BubbleDataPoint, Chart, ChartTypeRegistry, Point } from "chart.js";
import { EventSystem } from "./event-system";
import type { GameEvent, LoopEvent } from "./events";
import type { Loopable } from "./interfaces";
import type { WebGPURendererParameters } from "three/src/renderers/webgpu/WebGPURenderer.js";

export abstract class Context<T> {
    protected enabled: boolean = false;
    
    public wrapper: HTMLElement;
    public canvas: HTMLCanvasElement;
    protected title: HTMLParagraphElement;
    protected errorMessage: HTMLElement;

    private readonly resizeObserver: ResizeObserver;

    public constructor() {
        this.wrapper = document.createElement("div");
        this.wrapper.classList = "w-full h-full flex flex-col";

        this.title = document.createElement("p");
        this.title.classList = "w-full h-8 text-sm text-white flex items-center justify-center flex-none";
        this.wrapper.appendChild(this.title);

        this.canvas = document.createElement("canvas");
        this.canvas.classList = "flex-1";
        this.wrapper.appendChild(this.canvas);

        this.errorMessage = document.createElement("div");
        this.errorMessage.classList = "w-full h-full text-white flex items-center justify-center";
        this.wrapper.appendChild(this.errorMessage);

        this.resizeObserver = new ResizeObserver(() => { this.resize() });
        this.resizeObserver.observe(this.wrapper);
    }

    protected resize(): Context<T> {
        const rect = this.canvas.getBoundingClientRect();

        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);

        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }

        return this;
    }

    public setTitle(name: string): Context<T> { this.title.textContent = name.split(/(?=[A-Z])/).join(" "); return this; }

    public enable(): Context<T> { this.enabled = true; return this; }
    public disable(): Context<T> { this.enabled = false; return this; }

    public append(element: HTMLElement): Context<T> { element.appendChild(this.wrapper); return this; }
    public remove(element: HTMLElement): Context<T> { element.removeChild(this.wrapper); return this; }

    public hide(): Context<T> { this.wrapper.classList.add("hidden"); return this; }
    public show(): Context<T> { this.wrapper.classList.remove("hidden"); return this; }

    protected showAdvise(): Context<T> { this.errorMessage.classList.remove("hidden"); return this; }
    protected hideAdvise(): Context<T> { this.errorMessage.classList.add("hidden"); return this; }
}

export class Context3D extends Context<Context3D> implements Loopable {
    public readonly renderer: THREE.WebGPURenderer;
    private _camera: THREE.Camera | null = null;
    public get camera() { return this._camera };
    private _scene: THREE.Scene | null = null;
    public get scene() { return this._scene };

    public readonly gameEvents: EventSystem<GameEvent> = new EventSystem();
    public readonly loopEvents: EventSystem<LoopEvent> = new EventSystem();
    public app: Loopable | null = null;

    public constructor() {
        super();

        const params: WebGPURendererParameters = { alpha: true, antialias: true, canvas: this.canvas };
        this.renderer = new THREE.WebGPURenderer(params); 

        this.errorMessage.textContent = "There is no camera or scene to render";

        this.setActiveCamera(null);
        this.setScene(null);
    }

    public setActiveCamera(camera: THREE.Camera | null): Context3D {
        this._camera = camera;
        camera === null ? this.showAdvise() : this.hideAdvise();
        return this;
    }

    public setScene(scene: THREE.Scene | null): Context3D {
        this._scene = scene;
        scene === null ? this.showAdvise() : this.hideAdvise();
        return this;
    }

    public setApp(app: Loopable | null): Context3D {
        this.app = app;
        app === null ? this.showAdvise() : this.hideAdvise();
        return this;
    }

    protected resize(): Context3D {
        super.resize();

        const width = this.canvas.width;
        const height = this.canvas.height;

        this.renderer.setSize(width, height, false);

        if (this._camera instanceof THREE.PerspectiveCamera) {
            this._camera.aspect = width / height;
            this._camera.updateProjectionMatrix();
        }

        return this;
    }

    public update(deltaTime: number): void {
        if (!this.enabled) return;

        this.app?.update(deltaTime);
        if (this._scene && this._camera) this.renderer.render(this._scene, this._camera);
        // this.objects.forEach(object => object.update(deltaTime));
    }

    public fixedUpdate(): void {
        if (!this.enabled) return;

        // this.objects.forEach(object => object.fixedUpdate());
    }
}

export class ContextChart extends Context<ContextChart> implements Loopable {
    private chart: Chart | null = null;

    public constructor(){
        super();

        this.errorMessage.textContent = "There is no chart to render";
    }

    public setChart(chart: Chart | null): ContextChart {
        this.chart = chart;

        if (chart) {
            this.resize();
            chart.resize();
        }

        chart === null ? this.showAdvise() : this.hideAdvise();
        return this;
    }

    public update(_: number): void {
        if (!this.chart) return;
        this.chart.update("none");
    }

    public fixedUpdate(): void {}

    protected resize(): ContextChart {
        super.resize();

        this.chart?.resize();

        return this;
    }
}