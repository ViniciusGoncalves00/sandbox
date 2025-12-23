import { ObjectPool } from "./pool";

export class MeshPool<Mesh> extends ObjectPool<Mesh> {
    public override acquire(): Mesh | null {
        if (this.used.size >= this.maxSize) {
            console.warn("Pool has reached the maximum size.");
            return null;
        }

        const object = this.free.pop() ?? this.factory.create();
        this.used.add(object);
        return object;
    }

    public override release(object: Mesh): void {
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