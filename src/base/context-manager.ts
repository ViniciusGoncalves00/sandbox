import { Context } from "./context";
import { ContextFactory } from "./context-factory";
import { ObjectPool } from "./pool";

export class ContextManager {    
    private static readonly contexts: Set<Context> = new Set()
    private static readonly contextsPool: ObjectPool<Context> = new ObjectPool<Context>(new ContextFactory());

    public static async create(): Promise<Context> {
        const context = this.contextsPool.acquire()!;
        this.contexts.add(context);

        return context;
    }

    public static async createMany(amount: number = 1): Promise<Context[]> {
        const newcontexts: Context[] = [];

        for (let i = 0; i < amount; i++) {
            const context = this.contextsPool.acquire()!;
            this.contexts.add(context);
            newcontexts.push(context);
        }

        return newcontexts;
    }

    public static delete(context: Context): void {
        if(!this.contexts.has(context)) {
            console.warn("Session not found in the context.");
            return;
        }

        this.contexts.delete(context);
        this.contextsPool.release(context);
    }
}