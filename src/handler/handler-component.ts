import { Transformation, Axis, Space } from "./enums";

export class HandlerComponent {
    public readonly space: Space;
    public readonly axis: Axis;
    public readonly transformation: Transformation;

    public readonly id: string;

    public constructor(space: Space, axis: Axis, transformation: Transformation) {
        this.space = space;
        this.axis = axis;
        this.transformation = transformation;
        this.id = `${space}-${axis}-${transformation}`;
    }

    public isTranslate(): boolean {
        return this.transformation === Transformation.Translate;
    }

    public isRotate(): boolean {
        return this.transformation === Transformation.Rotate;
    }

    public isScale(): boolean {
        return this.transformation === Transformation.Scale;
    }
}