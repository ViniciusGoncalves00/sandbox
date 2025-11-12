import type { Camera, Mesh } from "three";

export class SelectionContext {
    public element: HTMLElement;
    public camera: Camera;
    public objects: Mesh[];
    
    public constructor(element: HTMLElement, camera: Camera, objects: Mesh[] = []) {
        this.element = element;
        this.camera = camera;
        this.objects = objects;
    }
}