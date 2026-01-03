import { Time } from "./time";
import { Context } from "./context";
import type { Application } from "./application";

export class Program<T extends Application> {
    private contexts: Context<T>[] = [];

    public constructor() {
        Time.start();
    }

    public createContext(): Context<T> {
        const context = new Context<T>();
        this.contexts.push(context);
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
