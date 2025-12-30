export abstract class Renderer<T extends Application> {
    protected application: T;

    public constructor(application: T) {
        this.application = application;
    }
    
    abstract mount(container: HTMLElement): void;
    abstract resize(width: number, height: number): void;
    abstract update(): void;
    abstract dispose(): void;
}

export abstract class Canvas2DRenderer<T extends Application> extends Renderer<T> {
    protected canvas!: HTMLCanvasElement;
    protected ctx!: CanvasRenderingContext2D;

    mount(container: HTMLElement): void {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d")!;
        container.appendChild(this.canvas);

        this.resize(
            container.clientWidth,
            container.clientHeight
        );
    }

    resize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    update(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    dispose(): void {
        this.canvas.remove();
    }
}

import * as THREE from "three";
import type { Application } from "./application";

export abstract class ThreeJSRenderer<T extends Application> extends Renderer<T> {
    protected renderer!: THREE.WebGLRenderer;
    protected scene!: THREE.Scene;
    protected camera!: THREE.Camera;

    mount(container: HTMLElement): void {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        container.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(-10, -10, 10);
        this.camera.lookAt(0, 0, 0);
        this.scene.add(this.camera);

        this.resize(
            container.clientWidth,
            container.clientHeight
        );
    }

    resize(width: number, height: number): void {
        this.renderer.setSize(width, height);

        if(this.camera instanceof THREE.PerspectiveCamera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }

    update(): void {
        this.renderer.render(this.scene, this.camera);
    }

    dispose(): void {
        this.renderer.dispose();
        this.renderer.domElement.remove();
    }

    getScene(): THREE.Scene {
        return this.scene;
    }

    getCamera(): THREE.Camera {
        return this.camera;
    }
}
