import * as THREE from "three"
import { Tag, Layer } from "./organizers";

export abstract class Base {
    public enabled: boolean;
    public name: string;
    public tag: Tag;
    public layer: Layer;

    public constructor(enabled: boolean = true, name: string = "Unnamed", tag: Tag = Tag.UNTAGGED, layer: Layer = Layer.DEFAULT) {
        this.enabled = enabled;
        this.name = name;
        this.tag = tag;
        this.layer = layer;
    }

    public awake(): void {};
    public start(): void {};
    public update(deltaTime: number): void {};
    public fixedUpdate(): void {};
    public lateUpdate(): void {};
    public destroy(): void {};
}

export class BaseObject extends Base {
    public readonly uuid: string;
    public readonly object: THREE.Object3D;

    public constructor(object: THREE.Object3D, enabled: boolean = true, name: string = "Unnamed Behavior", tag: Tag = Tag.UNTAGGED, layer: Layer = Layer.DEFAULT) {
        super(enabled, name, tag, layer);
        this.object = object;
        this.uuid = object.uuid;
    }
}