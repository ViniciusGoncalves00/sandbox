import { Canvas2DRenderer } from "../base/renderer";
import type { Example } from "./example";

export class ExampleCanvas2DRenderer extends Canvas2DRenderer<Example> {
    public update(): void {
        super.update();

        const v = (this.application.value + 1) * 0.5;
        
        const width = this.canvas.width * v;
        const height = this.canvas.height * v;
        
        const x = (this.canvas.width - width) / 2;
        const y = (this.canvas.height - height) / 2;
        
        this.ctx.fillStyle = `rgb(255, 255, 255)`;
        this.ctx.fillRect(x, y, width, height);
    }
}
