import * as THREE from "three";
import { Board } from "./board";
import { TileState } from "./utils";

export interface BoardRenderer {
    init(board: Board): void;
    render(board: Board): void;
    dispose(): void;
}

export class ThreeBoardRenderer implements BoardRenderer {
    private scene: THREE.Scene;
    private tiles: THREE.Mesh[] = [];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    init(board: Board): void {
        const geometry = new THREE.PlaneGeometry(1, 1);

        for (let i = 0; i < board.size; i++) {
            const { x, y } = this.indexToCoord(i, board.width);

            const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(x, 0, y);
            mesh.rotation.x = -Math.PI / 2;

            this.scene.add(mesh);
            this.tiles[i] = mesh;
        }
    }

    render(board: Board): void {
        for (let i = 0; i < board.size; i++) {
            const tile = board["grid"][i];
            const mesh = this.tiles[i];

            switch (tile) {
                case TileState.Empty:
                    (mesh.material as THREE.MeshBasicMaterial).color.set(0xaaaaaa);
                    break;
                case TileState.Snake:
                    (mesh.material as THREE.MeshBasicMaterial).color.set(0x33aaff);
                    break;
                case TileState.Food:
                    (mesh.material as THREE.MeshBasicMaterial).color.set(0xff3333);
                    break;
            }
        }
    }

    dispose(): void {
        this.tiles.forEach(t => {
            t.geometry.dispose();
            (t.material as THREE.Material).dispose();
            this.scene.remove(t);
        });
        this.tiles = [];
    }

    private indexToCoord(index: number, width: number) {
        return {
            x: index % width,
            y: Math.floor(index / width)
        };
    }
}
