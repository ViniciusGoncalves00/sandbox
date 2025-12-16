import type { EventType } from "../utils";

export class EventSystem {
    private static handlers: Set<(event: EventType) => void> = new Set();

    private constructor() {}

    public static notify(event: EventType): void {
        for (const handler of this.handlers) handler(event);
    }

    public static subscribe(handler: (event: EventType) => void): () => void {
        this.handlers.add(handler);
        return () => this.unsubscribe(handler);
    }

    public static unsubscribe(handler: (event: EventType) => void): void {
        this.handlers.delete(handler);
    }

    public static clear(): void {
        this.handlers.clear();
    }
}
