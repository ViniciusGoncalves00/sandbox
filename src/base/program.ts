import { Time } from "./time";
import { Context } from "./context";
import type { Application } from "./application";

export class Program<T extends Application> {
    private contexts: Map<number, Context<T>> = new Map();
    private counter: number = 0;

    public constructor() {
        Time.start();
    }

    public createContext(): Context<T> {
        const context = new Context<T>();

        Time.update.subscribe(() => context.application?.update());
        Time.fixedUpdate.subscribe(() => context.application?.fixedUpdate());
        Time.lateUpdate.subscribe(() => context.application?.lateUpdate());
        Time.lateUpdate.subscribe(() => context.viewport?.update());

        this.contexts.set(this.counter, context);
        this.counter++;
        return context;
    }
    
    public createContexts(amount: number): Context<T>[] {
        const contexts: Context<T>[] = [];
        for (let index = 0; index < amount; index++) {
            const context = this.createContext();
            contexts.push(context);
        }
        return contexts;
    }
}
