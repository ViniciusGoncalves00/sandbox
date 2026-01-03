import { Application } from "../base/application";
import { Time } from "../base/time";

export class Example extends Application {
    public value: number = 0;
    public angle: number = 0;
    public increment: number = 1;

    public update(): void {
        this.angle += this.increment * Time.deltaTime();
        this.value = (Math.sin(this.angle) + 1) / 2;
    }
}