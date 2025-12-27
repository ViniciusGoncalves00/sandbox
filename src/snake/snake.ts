import type { Vector2Int } from "./utils";

export class Snake {
    private positions: Vector2Int[] = [];

    public constructor(headPosition: Vector2Int, tailPosition:  Vector2Int) {
        this.positions.push(headPosition);
        this.positions.push(tailPosition);
    }

    public head(): Vector2Int {
        return this.positions[0];
    }

    public tail(): Vector2Int {
        return this.positions[this.positions.length - 1];
    }

    public move(position: Vector2Int): void  {
        this.positions.unshift(position);
        this.positions.pop();
    }

    public grow(position: Vector2Int): void  {
        this.positions.push(position);
    }

    public size(): number {
        return this.positions.length;
    }
}