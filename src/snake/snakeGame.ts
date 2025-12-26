import { Snake } from "./snake";
import { Board } from "./board";
import type { SnakeGameParameters, Vector2Int } from "./utils";
import { FinishEvent, LoopEvent } from "../base/events";
import { Camera, Scene, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import type { App3D } from "../base/interfaces";
import type { Context } from "../base/context";
import type { Player } from "./player";

export class SnakeGame implements App3D {
    public readonly board: Board;
    public readonly snake: Snake;
    public readonly player: Player;

    private context: Context;
    private updateRate: number;
    private accumulator: number = 0;

    private steps: number = 0;

    public constructor(context: Context, snakeGameParams: SnakeGameParameters, player: Player) {
        this.context = context;
        this.board = new Board(snakeGameParams.board);
        this.player = player;

        this.updateRate = 1000 / snakeGameParams.snake.speed;

        const head: Vector2Int = {
            x: Math.floor(snakeGameParams.board.width / 2),
            z: Math.floor(snakeGameParams.board.height / 2)
        }
        const tail: Vector2Int = {x: head.x, z: head.z - 1};

        this.board.setSnake(head);
        this.board.setSnake(tail);
        this.snake = new Snake(head, tail);

        this.board.newFood();

        context.activeCamera.position.set(snakeGameParams.board.width / 2, -(snakeGameParams.board.width + snakeGameParams.board.height) / 2 , snakeGameParams.board.height / 2);
        const down = new Vector3(context.activeCamera.position.x, context.activeCamera.position.x + 1, context.activeCamera.position.z)
        context.activeCamera.lookAt(down);
        
        const meshes = this.board.getAll().map(tile => tile.mesh);
        for (const mesh of meshes) {
            context.scene.add(mesh);
        }
    }
    enabled(): boolean {
        throw new Error("Method not implemented.");
    }
    start(): void {
        throw new Error("Method not implemented.");
    }
    started(): boolean {
        throw new Error("Method not implemented.");
    }
    fixedUpdate(): void {
        throw new Error("Method not implemented.");
    }
    lateUpdate(deltaTime: number): void {
        throw new Error("Method not implemented.");
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
            this.context.scene.remove(mesh);
            mesh.geometry.dispose();
        }
    }

    public updateSnake(direction: Vector2Int): void {
        if(!this.board.hasEmptyTile()) {
            this.context.gameEvents.notify(FinishEvent.WIN);
            return;
        }

        const tail = this.snake.tail();
        const head = this.snake.head();
        const newHead: Vector2Int = { x: head.x + direction.x, z: head.z + direction.z};
        
        if(!this.board.isInside(newHead) || this.board.hasSnake(newHead)) {
            this.context.gameEvents.notify(FinishEvent.LOSE);
            return;
        }
        
        if (this.board.hasFood(newHead)) {
            this.snake.move(newHead);
            this.snake.grow(tail);
        
            this.board.setSnake(newHead);
            this.board.newFood();
        }

        if(this.board.isEmpty(newHead)) {
            this.snake.move(newHead);

            this.board.setSnake(newHead);
            this.board.setEmpty(tail);
        }
    }
}