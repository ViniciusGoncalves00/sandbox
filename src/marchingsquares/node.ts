import type { Mesh } from "three";

export class Node {
    public mesh: Mesh;

    public constructor(mesh: Mesh) {
        this.mesh = mesh;
    }
}

export class ControlNode extends Node {
    public density: number;

    public constructor(density: number, mesh: Mesh) {
        super(mesh);

        this.density = density;
    }
}