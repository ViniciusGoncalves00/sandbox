import { Snake } from "./snake";
import { Board } from "./board";
import type { SnakeGameParameters, Vector2Int } from "./utils";
import { Camera, Scene, Vector3 } from "three";
import type { Player } from "./player";
import { Base, BaseObject } from "../base2/base";
import type { Viewport3D } from "../base2/viewport";
import { GameEvent } from "../base2/events";

export class SnakeGame extends Base {
    public readonly board: Board;
    public readonly snake: Snake;
    public readonly player: Player;
    
    public steps: number = 0;
    public stepsSinceLastFood: number = 0;
    public stepsPerFood: number[] = [];

    private viewport: Viewport3D;
    private updateRate: number;
    private accumulator: number = 0;

    public constructor(viewport: Viewport3D, snakeGameParams: SnakeGameParameters, player: Player) {
        super();

        this.viewport = viewport;
        this.board = new Board(snakeGameParams.board);
        this.player = player;

        this.updateRate = 1 / snakeGameParams.snake.speed;

        const head: Vector2Int = {
            x: Math.floor(snakeGameParams.board.width / 2),
            z: Math.floor(snakeGameParams.board.height / 2)
        }
        const tail: Vector2Int = {x: head.x, z: head.z - 1};

        this.board.setSnake(head);
        this.board.setSnake(tail);
        this.snake = new Snake(head, tail);

        this.board.newFood();

        viewport.camera!.position.set(snakeGameParams.board.width / 2, -(snakeGameParams.board.width + snakeGameParams.board.height) / 2 , snakeGameParams.board.height / 2);
        const down = new Vector3(viewport.camera!.position.x, viewport.camera!.position.x + 1, viewport.camera!.position.z)
        viewport.camera!.lookAt(down);
        
        const meshes = this.board.getAll().map(tile => tile.mesh);
        for (const mesh of meshes) {
            viewport.scene!.add(mesh);
        }
    }

    public update(deltaTime: number): void {
        this.accumulator += deltaTime;
        while (this.accumulator >= this.updateRate) {
            this.player.update(this);
            this.steps++;
            this.updateSnake(this.player.getDirection());
            this.accumulator -= this.updateRate;
        }
    }

    public destroy(): void {
        const meshes = this.board.getAll().map(tile => tile.mesh);

        for (const mesh of meshes) {
            this.viewport.scene!.remove(mesh);
            mesh.geometry.dispose();
        }
    }

    public updateSnake(direction: Vector2Int): void {
        if(!this.board.hasEmptyTile()) {
            this.viewport.gameEvents.notify(GameEvent.WIN);
            return;
        }
        this.steps++;
        this.stepsSinceLastFood++;

        const tail = this.snake.tail();
        const head = this.snake.head();
        const newHead: Vector2Int = { x: head.x + direction.x, z: head.z + direction.z};
        
        if(!this.board.isInside(newHead) || this.board.hasSnake(newHead)) {
            this.viewport.gameEvents.notify(GameEvent.LOSE);
            return;
        }
        
        if (this.board.hasFood(newHead)) {
            this.snake.move(newHead);
            this.snake.grow(tail);
        
            this.board.setSnake(newHead);
            this.board.newFood();
            
            this.stepsPerFood.push(this.stepsSinceLastFood);
            this.stepsSinceLastFood = 0;
            this.viewport.gameEvents.notify(GameEvent.ATE);
        }

        if(this.board.isEmpty(newHead)) {
            this.snake.move(newHead);

            this.board.setSnake(newHead);
            this.board.setEmpty(tail);
        }
    }
}