import type { WebGPURendererParameters } from "three/src/renderers/webgpu/WebGPURenderer.js";
import * as THREE from "three/webgpu";
import type { ContextParameters, Factory } from "./interfaces";
import { Context } from "./context";

export class ContextFactory implements Factory<Context> {
    public create(): Context {
        const canvas = document.createElement("canvas");
        canvas.classList.add("w-full", "h-full");

        const container = document.createElement("div");
        container.classList.add("w-full", "h-full");
        container.appendChild(canvas);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0.015, 0.015, 0.015);

        const fov: number = 75;
        const aspect: number = canvas.width / canvas.height;
        const near: number = 0.1;
        const far: number = 1000;

        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.name = "MainCamera";
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);
        scene.add(camera);

        const rendererParams: WebGPURendererParameters = { antialias: true, canvas: canvas };
        const renderer = new THREE.WebGPURenderer(rendererParams);
        renderer.setSize(canvas.width, canvas.height);
        const params: ContextParameters = { renderer, camera, scene, canvas, container };

        return new Context(params);
    }
}