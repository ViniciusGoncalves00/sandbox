import { Time } from "./time";
import { Context } from "./context";

export class Program {
    private static _instance: Program;
    private contexts: Map<number, Context> = new Map();
    private counter: number = 0;

    private constructor() {
        Time.start();
    }

    public static instance(): Program {
        if(!this._instance) {
            this._instance = new Program();
        }
        return this._instance;
    };

    public createContext(): Context {
        const context = new Context();
        
        Time.update.subscribe(() => context.application?.update());
        Time.fixedUpdate.subscribe(() => context.application?.fixedUpdate());
        Time.lateUpdate.subscribe(() => context.application?.lateUpdate());
        Time.lateUpdate.subscribe(() => context.viewport?.update());

        this.contexts.set(this.counter, context);
        this.counter++;
        return context;
    }
    
    public createContexts(amount: number): Context[] {
        const contexts: Context[] = [];
        for (let index = 0; index < amount; index++) {
            const context = this.createContext();
            contexts.push(context);
        }
        return contexts;
    }
}

// export class Application {
//     private viewports = new Map<string, Loopable>();
//     private counter = 0;

//     public constructor() {
//         Time.start();
//     }

//     public register<T extends Loopable>(viewport: T): T {
//         this.viewports.set(this.counter.toString(), viewport);
//         this.counter++;
//         return viewport;
//     }
// }
