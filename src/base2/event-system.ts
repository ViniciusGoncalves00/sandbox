import type { Event } from "./events";

export class EventSystem<T extends Event> {
    private handlers: Set<(event: T) => void> = new Set();
    
    public constructor() {}

    public notify(event: T): void {
        for (const handler of this.handlers) handler(event);
    }

    public subscribe(handler: (event: T) => void): () => void {
        this.handlers.add(handler);
        return () => this.unsubscribe(handler);
    }

    public unsubscribe(handler: (event: T) => void): void {
        this.handlers.delete(handler);
    }

    public clear(): void {
        this.handlers.clear();
    }
}
