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

export interface Loopable extends Updatable, FixedUpdatable {}

export interface Factory<T> {
    create(): T;
}

export interface Renderable {
    render(): Promise<void> | void;
}