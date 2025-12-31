import * as THREE from "three";
import { ThreeJSRenderer } from "../base/renderer";
import type { SnakeGame } from "./snakeGame";
import { TileState } from "./utils";
import { degToRad } from "three/src/math/MathUtils.js";

export class renderer3D extends ThreeJSRenderer<SnakeGame> {
    private tiles: THREE.Mesh[] = [];
    
    public constructor(application: SnakeGame) {
        super(application);
    }

    public start(container: HTMLElement): void {
        super.start(container);
        
        const board = this.application.board;
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        this.camera.position.set(board.width / 2, - (board.width + board.height) / 2 , board.height / 2);
        const target = this.camera.position.clone().add(new THREE.Vector3(0, 1, 0));
        this.camera.lookAt(target);
        this.camera.rotateZ(degToRad(180));

        for (let i = 0; i < board.size; i++) {
            const { x, y } = board.index2Coordinates(i);

            const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(x, 0, y);
            mesh.rotation.x = -Math.PI / 2;

            this.scene.add(mesh);
            this.tiles[i] = mesh;
        }
    }

    public update(): void {
        super.update();

        const board = this.application.board;
        for (let i = 0; i < board.size; i++) {
            const coordinates = board.index2Coordinates(i);
            const tile = board.getTile(coordinates);
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
}