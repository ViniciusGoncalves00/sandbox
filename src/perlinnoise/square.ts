import type { Vector3Like } from "three";
import type { ControlNode } from "./node";

export class Square<T extends ControlNode<Vector3Like> | ControlNode<Vector3Like>> {
    public botLeft: T;
    public botRight: T;
    public topRight: T;
    public topLeft: T;

    public constructor(botLeft: T, botRight: T, topRight: T, topLeft: T) {
        this.botLeft = botLeft;
        this.botRight = botRight;
        this.topRight = topRight;
        this.topLeft = topLeft;
    }
}