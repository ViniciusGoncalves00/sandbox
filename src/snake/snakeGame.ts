import { App, type ViewParameters } from "./base/app";
import { EventType, type SnakeGameParameters, type Vector2Int } from "./utils";
import { Snake } from "./snake";
import { Board } from "./board";
import { InputHandler } from "./input-handler";
import { EventSystem } from "./base/event-system";

export class SnakeGame extends App {
    public readonly board: Board;
    public readonly snake: Snake;
    public readonly input: InputHandler;

    private updateRate: number;
    private accumulator: number = 0;

    public constructor(viewParams: ViewParameters, snakeGameParams: SnakeGameParameters, input: InputHandler) {
        super(viewParams);
        this.board = new Board(snakeGameParams.board);
        this.input = input;

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

        const view = this.views[0];
        view.camera.position.set(snakeGameParams.board.width / 2, (snakeGameParams.board.width + snakeGameParams.board.height) / 2 , snakeGameParams.board.height / 2);
        
        const meshes = this.board.getAll().map(tile => tile.mesh);
        for (const mesh of meshes) {
            view.scene.add(mesh);
        }
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);

        this.accumulator += deltaTime;
        while (this.accumulator >= this.updateRate) {
            this.updateSnake(this.input.getDirection());
            this.accumulator -= this.updateRate;
        }
    }

    public destroy(): void {
        const view = this.views[0];
        const meshes = this.board.getAll().map(tile => tile.mesh);

        for (const mesh of meshes) {
            view.scene.remove(mesh);
            mesh.geometry.dispose();
        }
    }

    public updateSnake(direction: Vector2Int): void {
        if(!this.board.hasEmptyTile()) {
            EventSystem.notify(EventType.WIN);
            return;
        }

        const tail = this.snake.tail();
        const head = this.snake.head();
        const newHead: Vector2Int = { x: head.x + direction.x, z: head.z + direction.z};
        
        if(!this.board.isInside(newHead) || this.board.hasSnake(newHead)) {
            EventSystem.notify(EventType.LOSE);
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