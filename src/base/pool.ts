import type { Factory } from "./interfaces";

export class ObjectPool<T> {
    protected readonly free: T[] = [];
    protected readonly used = new Set<T>();
    protected readonly factory: Factory<T>;
    protected readonly maxSize: number;

    public get countFree(): number { return this.free.length }
    public get countUsed(): number { return this.used.size }
    public get countAll(): number { return this.free.length + this.used.size }

    public constructor(factory: Factory<T>, initialSize: number = 0, maxSize: number = Infinity) {
        this.factory = factory;
        this.maxSize = maxSize;

        for (let i = 0; i < initialSize; i++) {
            const object = this.factory.create();
            this.free.push(object);
        }
    }

    public acquire(): T | null {
        if (this.used.size >= this.maxSize) {
            console.warn("Pool has reached the maximum size.");
            return null;
        }

        const object = this.free.pop() ?? this.factory.create();
        this.used.add(object);
        return object;
    }

    public release(object: T): void {
        if (!this.used.has(object)) {
            console.warn("Trying to release object not owned by pool", object);
            return;
        }

        this.used.delete(object);
        this.free.push(object);
    }

    public clear(): void {
        this.free.length = 0;
        this.used.clear();
    }
}
