import { abs } from "three/tsl";
import type { Camera, Renderer, Scene, WebGPURenderer } from "three/webgpu";
import type { Context } from "./context";
import type { WebGLRenderer } from "three";

export interface Enableable {
    enabled(): boolean;
}

export interface Startable {
    start(): void;
    started(): boolean;
}

export interface Updatable {
    update(deltaTime: number): void;
}

export interface FixedUpdatable {
    fixedUpdate(): void;
}

export interface LateUpdatable {
    lateUpdate(deltaTime: number): void;
}

export interface Destroyable  {
    destroy(): void;
}

export interface App3D extends Enableable, Startable, Updatable, FixedUpdatable, LateUpdatable, Destroyable {
}

export interface Poolable<T> {
    set(params: T): void;
    reset(): void;
    destroy(): void;
}

export interface Parameters {}

export interface ContextParameters extends Parameters {
    renderer: WebGPURenderer,
    camera: Camera,
    scene: Scene,
    canvas: HTMLCanvasElement,
    container: HTMLDivElement
}

export interface Factory<T> {
    create(): T;
}

export interface ContextFactory<T extends Context> {
    create(context: Context): T;
}

export interface Renderable {
    render(): Promise<void> | void;
}