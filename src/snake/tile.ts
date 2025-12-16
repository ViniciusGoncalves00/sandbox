import { Color, MeshBasicMaterial, Vector2, type Mesh } from "three";

export class Tile {
    private static headMaterial = new MeshBasicMaterial({color: new Color(0.5, 0.1, 0.1)})
    private static emptyMaterial = new MeshBasicMaterial({color: new Color(0.9, 0.9, 0.9), wireframe: true})
    private static snakeMaterial = new MeshBasicMaterial({color: new Color(0.1, 0.5, 0.1)})
    private static foodMaterial = new MeshBasicMaterial({color: new Color(0.1, 0.1, 0.5)})
    
    public readonly mesh: Mesh;

    public constructor(mesh: Mesh) {
        this.mesh = mesh;
        this.setEmpty();
    }

    public setFood(): Tile {
        this.mesh.material = Tile.foodMaterial;
        this.mesh.scale.set(0.9, 0.9, 0.9);
        return this;
    }

    public setSnake(): Tile {
        this.mesh.material = Tile.snakeMaterial;
        this.mesh.scale.set(0.9, 0.9, 0.9);
        return this;
    }

    public setEmpty(): Tile {
        this.mesh.material = Tile.emptyMaterial;
        this.mesh.scale.set(1.0, 1.0, 1.0);
        return this;
    }

    public setHead(): Tile {
        this.mesh.material = Tile.headMaterial;
        this.mesh.scale.set(0.9, 0.9, 0.9);
        return this;
    }
}