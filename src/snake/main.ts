import { ShortcutHamiltoninanCycle, Human, HamiltonianCycle, GetAndBackHamiltonianCycle, HybridShortcutHamiltonianCycle, ShortestPath, ShortestValidDirectionImprovedPath, ShortestValidDirectionPath, HybridGetAndBackShortcutHamiltonianCycle, HybridGetAndBackHamiltonianCycle } from "./logic/player";

import { Program } from "../base/program";
import { Viewport } from "../base/viewport";
import { renderer3D } from "./visualization/renderer3D";
import { SnakeGame } from "./logic/snakeGame";
import type { BoardParameters, SnakeGameParameters, SnakeParameters, Vector2Int } from "./logic/utils";
import { ChartStepsPerFood } from "./visualization/chartStepsPerFood";
import { ChartSizePerStep } from "./visualization/chartSizePerStep";

const program = new Program();

const head: Vector2Int = { x: 1, y: 2};
const tail: Vector2Int = { x: 1, y: 1};
const initialSnake: Vector2Int[] = [head, tail]

const playerType = [
    HamiltonianCycle, ShortcutHamiltoninanCycle, GetAndBackHamiltonianCycle,
    HybridGetAndBackShortcutHamiltonianCycle, HybridShortcutHamiltonianCycle, HybridGetAndBackHamiltonianCycle,
];
const speeds = [
    150, 150, 150, 150, 150, 150,
];

for (let index = 0; index < playerType.length; index++) {
    const context = program.createContext();

    const snakeParams: SnakeParameters = { speed: speeds[index], initial: initialSnake};
    const gridParams: BoardParameters = { width: 10, height: 10 };
    const snakeGameParams: SnakeGameParameters = {
        snake: snakeParams,
        board: gridParams
    };

    const snakeGame = new SnakeGame(snakeGameParams, new playerType[index], context.applicationEvents);
    const container = document.getElementById(`container${index}`)!
    
    context
        .setApplication(snakeGame)
        .addViewport("three", new Viewport(new renderer3D(snakeGame), container, playerType[index].name))
        .addViewport("chart1", new Viewport(new ChartSizePerStep(snakeGame), container, "Size Per Step"))
        .addViewport("chart2", new Viewport(new ChartStepsPerFood(snakeGame), container, "Steps Per Food"))
        .init();
}
