import type { Mesh, Vector2Like, Vector3Like } from "three";

export class Node<T extends Vector3Like> {
    public position: T;
    public mesh: Mesh;

    public constructor(position: T, mesh: Mesh) {
        this.position = position;
        this.mesh = mesh;
    }
}

export class ControlNode<T extends Vector3Like> extends Node<T> {
    public direction: T;

    public constructor(position: T, direction: T, mesh: Mesh) {
        super(position, mesh);

        this.direction = direction;
    }
}