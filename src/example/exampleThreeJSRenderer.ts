import * as THREE from "three";
import { ThreeJSRenderer } from "../base/renderer";
import type { Example } from "./example";

export class ExampleThreeJSRenderer extends ThreeJSRenderer<Example> {
    private mesh: THREE.Mesh;
    
    public constructor(application: Example) {
        super(application);

        const geometry = new THREE.BoxGeometry(10, 10, 10);
        this.mesh = new THREE.Mesh(geometry);
    }

    public mount(container: HTMLElement): void {
        super.mount(container);
        
        this.scene.add(this.mesh);
    }

    public update(): void {
        super.update();

        const v = this.application.value;
        this.mesh.scale.set(v, v, v);
    }
}