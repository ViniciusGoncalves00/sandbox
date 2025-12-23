import type { Vector2Int } from "./utils";

export class InputHandler {
    private direction: Vector2Int = { x: 0, z: 1 };
    private up: Vector2Int = { x: 0, z: 1 };
    private down: Vector2Int = { x: 0, z: -1 };
    private left: Vector2Int = { x: -1, z: 0 };
    private right: Vector2Int = { x: 1, z: 0 };
    private handle: (e: KeyboardEvent) => void;

    public constructor() {
        this.handle = (e) => this.onKeyDown(e);
        window.addEventListener("keydown", this.handle);
    }

    public getDirection(): Vector2Int {
        return this.direction;
    }

    public destroy(): void {
        window.addEventListener("keydown", this.handle);
    }

    private onKeyDown(e: KeyboardEvent) {
        const key = e.key.toLowerCase();

        if(key === "s") { this.direction = this.direction !== this.down ? this.up : this.down; }
        if(key === "d") { this.direction = this.direction !== this.right ? this.left : this.right; }
        if(key === "w") { this.direction = this.direction !== this.up ? this.down : this.up; }
        if(key === "a") { this.direction = this.direction !== this.left ? this.right : this.left; }
    }
}