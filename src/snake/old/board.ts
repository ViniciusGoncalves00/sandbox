import { BoxGeometry, Mesh, MeshPhongMaterial } from "three/webgpu";
import { Tile } from "./tile";
import { type BoardParameters, type Vector2Int } from "./utils";

export class Board {
    public readonly width: number
    public readonly height: number

    private readonly emptyTiles: Map<string, Tile> = new Map();
    private readonly snakeTiles: Map<string, Tile> = new Map();
    private readonly foodTiles: Map<string, Tile> = new Map();

    public constructor(params: BoardParameters) {
        this.width = params.width;
        this.height = params.height;

        const geometry = new BoxGeometry();
        const material = new MeshPhongMaterial({wireframe: true});
        const mesh = new Mesh(geometry, material);

        for (let x = 0; x < params.width; x++) {
            for (let z = 0; z < params.height; z++) {
                const clone = mesh.clone();
                clone.position.set(x, 0, z);
                
                const key = this.index2key({x, y: z});
                const tile = new Tile(clone, {x: x, y: z});
                this.emptyTiles.set(key, tile);
            }
        }
    }

    public get(position: Vector2Int): Tile | undefined {
        const key = this.index2key(position);
        if(this.emptyTiles.has(key)) return this.emptyTiles.get(key);
        if(this.snakeTiles.has(key)) return this.snakeTiles.get(key);
        if(this.foodTiles.has(key)) return this.foodTiles.get(key);
    }

    public getAll(): Tile[] {
        return [
            ...this.emptyTiles.values().toArray(),
            ...this.snakeTiles.values().toArray(),
            ...this.foodTiles.values().toArray(),
        ]
    }

    public getAllEmpty(): Tile[] {
        return this.emptyTiles.values().toArray()
    }

    public getAllSnake(): Tile[] {
        return this.snakeTiles.values().toArray()
    }

    public getAllFood(): Tile[] {
        return this.foodTiles.values().toArray()
    }

    public isInside(position: Vector2Int): boolean {
        return this.get(position) === undefined ? false : true;
    }

    public getEmptyTile(position: Vector2Int): Tile | undefined {
        const key = this.index2key(position);
        return this.emptyTiles.get(key);
    }

    public getSnakeTile(position: Vector2Int): Tile | undefined {
        const key = this.index2key(position);
        return this.snakeTiles.get(key);
    }

    public getFoodTile(position: Vector2Int): Tile | undefined {
        const key = this.index2key(position);
        return this.foodTiles.get(key);
    }

    // public nearestFood(position: Vector2Int): Tile | undefined {
    //     const key = this.index2key(position);

    //     let nearestFood: Tile;

    //     this.foodTiles.keys().forEach(key => {
    //         const pos = this.key2index(key);
    //     })
    // }

    public hasEmptyTile(): boolean {
        return this.emptyTiles.size > 0;
    }

    public hasFood(position: Vector2Int): boolean {
        const key = this.index2key(position);
        return this.foodTiles.has(key);
    }

    public hasSnake(position: Vector2Int): boolean {
        const key = this.index2key(position);
        return this.snakeTiles.has(key);
    }

    public isEmpty(position: Vector2Int): boolean {
        const key = this.index2key(position);
        return this.emptyTiles.has(key);
    }

    public setSnake(position: Vector2Int): void {
        const key = this.index2key(position);
        if(!this.emptyTiles.has(key) && !this.foodTiles.has(key)) return;

        const tile = this.emptyTiles.get(key)! ?? this.foodTiles.get(key)!;
        this.snakeTiles.set(key, tile);
        tile.setSnake();
        
        if(this.emptyTiles.has(key)) this.emptyTiles.delete(key);
        if(this.foodTiles.has(key)) this.foodTiles.delete(key);
    }

    public setEmpty(position: Vector2Int): void {
        const key = this.index2key(position);
        if(!this.snakeTiles.has(key) && !this.foodTiles.has(key)) return;

        const tile = this.snakeTiles.get(key)! ?? this.foodTiles.get(key)!;
        this.emptyTiles.set(key, tile);
        tile.setEmpty();

        if(this.snakeTiles.has(key)) this.snakeTiles.delete(key);
        if(this.foodTiles.has(key)) this.foodTiles.delete(key);
    }

    public index2key(position: Vector2Int): string {
        return `${position.x},${position.y}`
    }

    public key2index(key: string): Vector2Int {
        const [x, z] = key.split(",");
        return {x: parseFloat(x), y: parseFloat(z)}
    }

    public newFood(): void {
        if(!this.hasEmptyTile()) return;

        let position: Vector2Int
        let key: string;
        do {
            position =  {
                x: Math.floor(Math.random() * this.width),
                y: Math.floor(Math.random() * this.height),
            }
            key = this.index2key(position);
        } while (!this.emptyTiles.has(key));

        this.setFood(position);
    }

    private setFood(position: Vector2Int): void {
        const key = this.index2key(position);
        if(!this.emptyTiles.has(key) || this.snakeTiles.has(key)) return;

        const tile = this.emptyTiles.get(key)!;
        this.foodTiles.set(key, tile);
        tile.setFood();

        this.emptyTiles.delete(key);
    }
}