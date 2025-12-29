import type { ContextFactory } from "../base/interfaces";
import type { Context } from "../base/context";
import { InputHandler } from "./input-handler";
import { SnakeGame } from "./snakeGame";

export class SnakeContextFactory implements ContextFactory<SnakeGame> {
    public create(session: Context): SnakeGame {
        const snakeParams = { speed: 10 };
        const boardParams = { width: 10, height: 10 };

        const input = new InputHandler();
        const game = new SnakeGame(session, {
            snake: snakeParams,
            board: boardParams
        }, input);

        session.loop.add(deltaTime => game.update(deltaTime));
        return game;
    }
}