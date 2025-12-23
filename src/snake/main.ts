import type { BoardParameters, SnakeGameParameters, SnakeParameters } from "../snake/utils";
import { SnakeGame } from "../snake/snakeGame";
import { InputHandler } from "../snake/input-handler";
import { ContextManager } from "../base/context-manager";
import type { Context } from "../base/context";

(async () => {
    const steps = [1, 4, 9];
    const timings = [3000, 3000, 3000];
    let total = 0

    for (let index = 0; index < steps.length; index++) {
        const amount = steps[index];
        total += amount;
        const duration = timings[index];
        const games: SnakeGame[] = [];
        let contexts: Context[] = [];

        await ContextManager.createMany(amount).then((newContexts) => {
            contexts.push(...newContexts);
            newContexts.forEach((context) => {
                document.body.appendChild(context.container);
            
                const snakeParams: SnakeParameters = { speed: 10 };
                const gridParams: BoardParameters = { width: 10, height: 10 };
                const snakeGameParams: SnakeGameParameters = {
                    snake: snakeParams,
                    board: gridParams
                };
                const input = new InputHandler();
                const snake = new SnakeGame(context, snakeGameParams, input);
                games.push(snake);
                context.loop.add((deltaTime) => snake.update(deltaTime));
            
                context.start();
            })
        
            updateGridLayout(amount)
        });

        if(index < steps.length - 1) {
            await new Promise(resolve => setTimeout(resolve, duration));
            contexts!.forEach(context => {
                document.body.removeChild(context.container);
                ContextManager.delete(context);
            });
            contexts!.splice(0);
            games.forEach(game => game.destroy());
        }
    }
})();

function updateGridLayout(count: number) {
    if (count <= 0) return { cols: 1, rows: 1 };

    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    document.body.classList.remove(
        "grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4",
        "grid-rows-1", "grid-rows-2", "grid-rows-3", "grid-rows-4"
    );
    
    document.body.classList.add(
        `grid-cols-${cols}`,
        `grid-rows-${rows}`
    );
}