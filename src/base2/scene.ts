// import * as THREE from "three";
// import { Base, BaseObject } from "./base";
// import { EventSystem } from "./event-system";
// import type { FinishEvent, LoopEvent } from "./events";
// import { Layer, Tag } from "./organizers";

// export class Scene extends Base {
//     public readonly objects: Map<string, Base> = new Map();

//     public constructor(canvas: HTMLCanvasElement, enabled?: boolean, name: string = "Unnamed Scene", tag?: Tag, layer?: Layer) {
//         super(enabled, name, tag, layer);

//         this.scene = new THREE.Scene();

//     }

//     public update(deltaTime: number): void {
//         this.renderer.render(this.scene, this.activeCamera);
//         this.objects.forEach(object => object.update(deltaTime));
//     }
    
//     public fixedUpdate(): void {
//         this.objects.forEach(object => object.fixedUpdate());
//     }

//     public addObject(object: BaseObject): void {
//         object.awake();
//         object.start();

//         this.objects.set("", object);
//         this.scene.add(object.object);
//     }

//     public createObject(object: THREE.Object3D): void {
//         const wrapper = new BaseObject(object);
//         this.addObject(wrapper)
//     }

//     public removeObject(object: BaseObject): void {
//         const wrapper = this.objects.get(object.uuid);
//         if (!wrapper) return;

//         wrapper.destroy();
//         this.objects.delete(object.uuid);
//         this.scene.remove(object.object);
//     }
// }