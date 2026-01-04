import { type SnakeGameParameters, type Vector2Int } from "./utils";
import type { Player } from "./player";
import { Board } from "./board";
import { ApplicationEvent } from "../../base/events";
import { EventSystem } from "../../base/event-system";
import { Application } from "../../base/application";
import { Time } from "../../base/time";
import { SnakeEvent } from "./events";

export class SnakeGame extends Application {
    public readonly board: Board;
    public readonly player: Player;

    public steps = 0;
    public stepsSinceLastFood = 0;
    public stepsPerFood: number[] = [];

    public readonly events: EventSystem<SnakeEvent> = new EventSystem();

    private readonly updateRate: number;
    private accumulator = 0;

    public constructor(params: SnakeGameParameters, player: Player) {
        super();
        
        this.player = player;

        this.board = new Board(
            params.board.width,
            params.board.height,
            params.snake.initial
        );

        this.updateRate = 1 / params.snake.speed;
    }

    public update(): void {
        this.accumulator += Time.deltaTime();

        while (this.accumulator >= this.updateRate) {
            this.player.update(this);

            this.step();
            this.accumulator -= this.updateRate;
        }
    }

    public fixedUpdate(): void {}

    private step(): void {
        const direction = this.player.getDirection();
        const head = this.board.getHead();

        const newHead: Vector2Int = {
            x: head.x + direction.x,
            y: head.y + direction.y
        };

        if (!this.board.isInside(newHead)) {
            return;
        }

        if (this.board.isSnake(newHead) && !this.board.isSnakeTail(newHead)) {
            return;
        }

        this.steps++;
        this.stepsSinceLastFood++;

        const ateFood = this.board.isFood(newHead);

        this.board.moveSnake(newHead, !ateFood);
        this.events.notify(SnakeEvent.MOVED);

        if (ateFood) {
            this.board.newFood();

            this.stepsPerFood.push(this.stepsSinceLastFood);
            this.stepsSinceLastFood = 0;

            this.events.notify(SnakeEvent.ATE);
        }
    }

    public isVictory(): boolean {
        return this.board.snakeSize() === this.board.size;
    }

    public isDefeat(): boolean {
        const direction = this.player.getDirection();
        const head = this.board.getHead();

        const newHead: Vector2Int = {
            x: head.x + direction.x,
            y: head.y + direction.y
        };

        if (!this.board.isInside(newHead)) {
            return true;
        }

        if (this.board.isSnake(newHead) && !this.board.isSnakeTail(newHead)) {
            return true;
        }

        return false;
    }
}
