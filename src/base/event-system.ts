import type { Event } from "./events";

export class EventSystem<T extends Event> {
    private listeners: Set<(event: T) => void> = new Set();

    public notify(event: T): void {
        for (const listener of this.listeners) listener(event);
    }

    public subscribe(listener: (event: T) => void): () => void {
        this.listeners.add(listener);
        return () => this.unsubscribe(listener);
    }

    public unsubscribe(listener: (event: T) => void): void {
        this.listeners.delete(listener);
    }

    public clear(): void {
        this.listeners.clear();
    }
}
