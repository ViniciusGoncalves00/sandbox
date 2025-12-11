import { type Camera, type Scene, type Renderer, Vector2 } from "three/webgpu";
import { Arena } from "./grid";

export class Game {
    private updateRateMS: number = 15;
    private lastUpdate: number = 0;
    private lastTimestamp: number = 0;

    private renderer: Renderer;
    private camera: Camera;
    private scene: Scene;

    private arena: Arena | null = null;

    private direction: { x: number, z: number} = { x: 0, z: 1};
    private readonly up: { x: number, z: number} = { x: 0, z: 1};
    private readonly left: { x: number, z: number} = { x: -1, z: 0};
    private readonly down: { x: number, z: number} = { x: 0, z: -1};
    private readonly right: { x: number, z: number} = { x: 1, z: 0};

    public constructor(renderer: Renderer, camera: Camera, scene: Scene, canvas: HTMLCanvasElement) {
        this.renderer = renderer;
        this.camera = camera;
        this.scene = scene;

        this.loop = this.loop.bind(this);

        window.addEventListener("keydown", (event) => {
            const key = event.key.toLowerCase();

            if(key === "w") {
                this.direction = this.direction !== this.down ? this.up : this.down;
            }
            if(key === "d") {
                this.direction = this.direction !== this.right ? this.left : this.right;
            }
            if(key === "s") {
                this.direction = this.direction !== this.up ? this.down : this.up;
            }
            if(key === "a") {
                this.direction = this.direction !== this.left ? this.right : this.left;
            }
        })
    }

    public start(): Game {
        const params = {
            size: {x: 10, z: 10},
            origin: {x: 0, z: 0}
        };
        this.arena = new Arena(params);
        this.arena.tileMap.forEach(tile => this.scene.add(tile.mesh));
        requestAnimationFrame(this.loop);
        return this;
    }

    public finish(): Game {
        return this;
    }

    public pause(): Game {
        cancelAnimationFrame(this.lastTimestamp);
        return this;
    }

    public resume(): Game {
        requestAnimationFrame(this.loop);
        return this;
    }

    private loop(): void {
        this.lastTimestamp = requestAnimationFrame(this.loop);
        const counter = this.lastTimestamp - this.lastUpdate;
        if (counter > this.updateRateMS) {
            this.update();
            this.lastUpdate = this.lastTimestamp;
        }
    }

    private update(): void {
        this.renderer.renderAsync(this.scene, this.camera);
        this.arena?.tryMoveSnake(this.direction.x, this.direction.z);
    }
}