import * as THREE from "three";
import type { BubbleDataPoint, Chart, ChartTypeRegistry, Point } from "chart.js";
import { EventSystem } from "./event-system";
import type { GameEvent, LoopEvent } from "./events";
import type { Loopable } from "./interfaces";

export abstract class Viewport<T> {
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
        this.title.classList = "w-full h-8 text-white flex items-center justify-center flex-none";
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

    protected resize(): Viewport<T> {
        const rect = this.canvas.getBoundingClientRect();

        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);

        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }

        return this;
    }

    public setTitle(name: string): Viewport<T> { this.title.textContent = name; return this; }

    public enable(): Viewport<T> { this.enabled = true; return this; }
    public disable(): Viewport<T> { this.enabled = false; return this; }

    public append(element: HTMLElement): Viewport<T> { element.appendChild(this.wrapper); return this; }
    public remove(element: HTMLElement): Viewport<T> { element.removeChild(this.wrapper); return this; }

    public hide(): Viewport<T> { this.wrapper.classList.add("hidden"); return this; }
    public show(): Viewport<T> { this.wrapper.classList.remove("hidden"); return this; }

    protected showAdvise(): Viewport<T> { this.errorMessage.classList.remove("hidden"); return this; }
    protected hideAdvise(): Viewport<T> { this.errorMessage.classList.add("hidden"); return this; }
}

export class Viewport3D extends Viewport<Viewport3D> implements Loopable {
    public readonly renderer: THREE.WebGLRenderer;
    private _camera: THREE.Camera | null = null;
    public get camera() { return this._camera };
    private _scene: THREE.Scene | null = null;
    public get scene() { return this._scene };

    public readonly gameEvents: EventSystem<GameEvent> = new EventSystem();
    public readonly loopEvents: EventSystem<LoopEvent> = new EventSystem();

    public constructor() {
        super();

        const params: THREE.WebGLRendererParameters = { alpha: true, antialias: true, canvas: this.canvas };
        this.renderer = new THREE.WebGLRenderer(params);

        this.errorMessage.textContent = "There is no camera or scene to render";

        this.setActiveCamera(null);
        this.setScene(null);
    }

    public setActiveCamera(camera: THREE.Camera | null): Viewport3D {
        this._camera = camera;
        camera === null ? this.showAdvise() : this.hideAdvise();
        return this;
    }

    public setScene(scene: THREE.Scene | null): Viewport3D {
        this._scene = scene;
        scene === null ? this.showAdvise() : this.hideAdvise();
        return this;
    }

    protected resize(): Viewport3D {
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

        if (this._scene && this._camera) this.renderer.render(this._scene, this._camera);
        // this.objects.forEach(object => object.update(deltaTime));
    }

    public fixedUpdate(): void {
        if (!this.enabled) return;

        // this.objects.forEach(object => object.fixedUpdate());
    }
}

export class ViewportChart extends Viewport<Chart> implements Loopable {
    private chart: Chart | null = null;

    public constructor(){
        super();

        this.errorMessage.textContent = "There is no chart to render";
    }

    public setChart(chart: Chart | null): ViewportChart {
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

    protected resize(): ViewportChart {
        super.resize();

        this.chart?.resize();

        return this;
    }
}