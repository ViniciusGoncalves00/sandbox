import type { Chart } from "chart.js";
import { Loop } from "./loop";
import { Viewport3D } from "./viewport";
import type { Loopable } from "./interfaces";

// export class Application {
//     public readonly loop;
//     private viewport: Map<string, Viewport3D> = new Map();
//     private counter: number = 0;

//     public constructor() {
//         this.loop = new Loop(this.viewport);
//         this.loop.start();
//     }

//     public createViewport(): Viewport3D {
//         const viewport = new Viewport3D();
//         this.viewport.set(this.counter.toString(), viewport);
//         this.counter++;
//         return viewport;
//     }
    
//     public createViewports(amount: number): Viewport3D[] {
//         const viewports: Viewport3D[] = [];
//         for (let index = 0; index < amount; index++) {
//             const viewport = this.createViewport();
//             viewports.push(viewport);
//         }
//         return viewports;
//     }
// }

export class Application {
    public readonly loop: Loop;
    private viewports = new Map<string, Loopable>();
    private counter = 0;

    public constructor() {
        this.loop = new Loop(this.viewports);
        this.loop.start();
    }

    public register<T extends Loopable>(viewport: T): T {
        this.viewports.set(this.counter.toString(), viewport);
        this.counter++;
        return viewport;
    }
}
