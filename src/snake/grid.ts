import { BoxGeometry, Mesh, MeshPhongMaterial, Scene, Vector2 } from "three/webgpu";
import { Tile } from "./tile";
import { Node } from "./node";
import { update } from "three/examples/jsm/libs/tween.module.js";

export interface GridParameters {
    size: { x: number, z: number};
    origin: { x: number, z: number};
}

export class Arena {
    public readonly tileMap: Map<string, Tile> = new Map();
    public readonly parameters: GridParameters;

    public readonly emptyTiles: Tile[] = [];
    public readonly snakeHead: Node;
    public foodTile: Tile | null = null;

    public constructor(params: GridParameters) {
        this.parameters = params;

        const geometry = new BoxGeometry();
        const material = new MeshPhongMaterial({wireframe: true});
        const mesh = new Mesh(geometry, material);

        for (let x = 0; x < params.size.x; x++) {
            for (let z = 0; z < params.size.z; z++) {
                const clone = mesh.clone();
                clone.position.set(x, 0, z);
                
                const key = this.key(x, z);
                this.tileMap.set(key, new Tile(clone, new Vector2(x, z)));
            }
        }

        const key = this.key(params.origin.x, params.origin.z);
        const tile = this.tileMap.get(key)!;
        this.snakeHead = new Node(tile);
        tile.setSnake();
        this.randomizeFood();
    }
    

    public getTile(x: number, z: number): Tile | null {
        const key = this.key(x, z);
        const tile = this.tileMap.get(key);

        if(!tile) {
            console.log("Was not possible to get tile.");
            return null;
        }

        return tile;
    }

    public randomizeFood(): Tile | undefined {
        let x;
        let z;
        let tile;
        do {
            x = Math.floor(Math.random() * this.parameters.size.x);
            z = Math.floor(Math.random() * this.parameters.size.z);

            tile = this.tileMap.get(this.key(x, z));
        } while (tile?.hasSnake());

        if(!tile) return;

        this.foodTile = tile;
        tile.setFood();
        return tile;
    }

    // public setFood(x: number, z: number): Tile | undefined {
    //     const key = this.key(x, z);
    //     const tile = this.tileMap.get(key);
    //     if(!tile) return;

    //     this.foodTile = tile;
    //     tile.setFood();
    //     return tile;
    // }

    // public setSnake(x: number, z: number): Tile | undefined {
    //     const key = this.key(x, z);
    //     const tile = this.tileMap.get(key);
    //     if(!tile) return;

    //     tile.setSnake();
    //     return tile;
    // }

    // public setEmpty(x: number, z: number): Tile | undefined {
    //     const key = this.key(x, z);
    //     const tile = this.tileMap.get(key);
    //     if(!tile) return;

    //     tile.setEmpty();
    //     return tile;
    // }

    public tryMoveSnake(x: number, z: number): void {
        const key = this.key(this.snakeHead.tile.index.x + x, this.snakeHead.tile.index.y + z);
        const nextTile = this.tileMap.get(key);
        if(!nextTile) {
            console.log("Lose");
            return;
        }

        if(nextTile.isEmpty()) {
            this.move(nextTile);
        } else if(nextTile.hasSnake()) {
            console.log("Lose");
            return;
        } else if (nextTile.hasFood()) {
            if(this.isVictory()) {
                console.log("Win");
                return;
            } else {
                this.moveAndGrow(nextTile);
                this.randomizeFood();
            }
        }
    }

    private move(nextHeadTile: Tile) {
        let prevTile = this.snakeHead.tile;

        this.snakeHead.tile.setEmpty();
        this.snakeHead.tile = nextHeadTile;
        nextHeadTile.setSnake();

        let current = this.snakeHead.child;

        while (current) {
            const oldTile = current.tile;
            current.tile = prevTile;
            prevTile.setSnake();
            prevTile = oldTile;
            oldTile.setEmpty();
            current = current.child;
        }
    }

    private moveAndGrow(nextHeadTile: Tile) {
        let prevTile = this.snakeHead.tile;

        this.snakeHead.tile.setEmpty();
        this.snakeHead.tile = nextHeadTile;
        nextHeadTile.setSnake();

        let current = this.snakeHead.child;

        while (current) {
            const oldTile = current.tile;
            current.tile = prevTile;
            prevTile.setSnake();
            prevTile = oldTile;
            current = current.child;
        }

        const newTail = new Node(prevTile);
        prevTile.setSnake();

        let tail = this.snakeHead;
        while (tail.child) tail = tail.child;

        tail.child = newTail;
    }

    public isVictory(): boolean {
        // return this.snakeTiles.length === this.tileMap.size;
        return false;
    }

    private key(x: number, z: number): string {
        return `${x},${z}`
    }
}