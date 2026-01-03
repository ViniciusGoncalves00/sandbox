import { type SnakeGameParameters, type Vector2Int } from "./utils";
import type { Player } from "./player";
import { Board } from "./board";
import { ApplicationEvent } from "../base/events";
import type { EventSystem } from "../base/event-system";
import { Application } from "../base/application";
import { Time } from "../base/time";

export class SnakeGame extends Application {
    public readonly board: Board;
    public readonly player: Player;

    public steps = 0;
    public stepsSinceLastFood = 0;
    public stepsPerFood: number[] = [];

    private readonly events: EventSystem<ApplicationEvent>;
    private readonly updateRate: number;
    private accumulator = 0;

    public constructor(params: SnakeGameParameters, player: Player, events: EventSystem<ApplicationEvent>) {
        super();
        
        this.player = player;
        this.events = events;

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
        const head = this.board.getSnake()[0];

        const newHead: Vector2Int = {
            x: head.x + direction.x,
            y: head.y + direction.y
        };

        if (!this.board.isInside(newHead)) {
            // this.events.notify(ApplicationEvent.Pause);
            return;
        }

        if (this.board.isSnake(newHead) && !this.board.isSnakeTail(newHead)) {
            // this.events.notify(ApplicationEvent.Pause);
            return;
        }

        this.steps++;
        this.stepsSinceLastFood++;

        const ateFood = this.board.isFood(newHead);

        this.board.moveSnake(newHead, !ateFood);

        if (ateFood) {
            this.board.newFood();

            this.stepsPerFood.push(this.stepsSinceLastFood);
            this.stepsSinceLastFood = 0;

            // this.events.notify(ApplicationEvent.ATE);

            if (this.board.snakeSize() === this.board.width * this.board.height) {
                this.events.notify(ApplicationEvent.Pause);
            }
        }
    }
}
