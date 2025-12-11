import { Color, Material, MeshBasicMaterial, Vector2, type Mesh } from "three";

export class Tile {
    private static emptyMaterial = new MeshBasicMaterial({color: new Color(0.1, 0.1, 0.1), wireframe: true})
    private static snakeMaterial = new MeshBasicMaterial({color: new Color(0.1, 0.5, 0.1)})
    private static foodMaterial = new MeshBasicMaterial({color: new Color(0.5, 0.1, 0.1)})
    
    public readonly mesh: Mesh;
    public readonly index: Vector2;
    private isFood: boolean = false;
    private isSnake: boolean = false;

    public constructor(mesh: Mesh, index: Vector2) {
        this.mesh = mesh;
        this.index = index;
        this.setEmpty();
    }

    public setFood(): Tile {
        this.isFood = true;
        this.isSnake = false;
        this.mesh.material = Tile.foodMaterial;
        return this;
    }

    public setSnake(): Tile {
        this.isSnake = true;
        this.isFood = false;
        this.mesh.material = Tile.snakeMaterial;
        return this;
    }

    public setEmpty(): Tile {
        this.isFood = false;
        this.isSnake = false;
        this.mesh.material = Tile.emptyMaterial;
        return this;
    }

    public hasFood(): boolean {
        return this.isFood;
    }

    public hasSnake(): boolean {
        return this.isSnake;
    }

    public isEmpty(): boolean {
        return !(this.isFood || this.isSnake);
    }
}