import type { Tile } from "./tile";

export class Node {
    public tile: Tile
    public parent: Node | null;
    public child: Node | null;

    public constructor(tile: Tile, parent: Node | null = null, child: Node | null = null) {
        this.tile = tile;
        this.parent = parent;
        this.child = child;
    }
}