import type { Camera, Object3D } from "three";

export class SelectionContext {
    public element: HTMLCanvasElement;
    public camera: Camera;
    public objects: Object3D[];
    
    public constructor(element: HTMLCanvasElement, camera: Camera, objects: Object3D[] = []) {
        this.element = element;
        this.camera = camera;
        this.objects = objects;
    }
}