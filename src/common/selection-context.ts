import type { Camera, Object3D } from "three";

export class SelectionContext {
    public element: HTMLElement;
    public camera: Camera;
    public objects: Object3D[];
    
    public constructor(element: HTMLElement, camera: Camera, objects: Object3D[] = []) {
        this.element = element;
        this.camera = camera;
        this.objects = objects;
    }
}