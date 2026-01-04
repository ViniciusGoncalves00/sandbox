import { ShortcutHamiltoninanCycle, Human, HamiltonianCycle, GetAndBackHamiltonianCycle, HybridShortcutHamiltonianCycle, ShortestPath, ShortestValidDirectionImprovedPath, ShortestValidDirectionPath, HybridGetAndBackShortcutHamiltonianCycle, HybridGetAndBackHamiltonianCycle } from "./logic/player";

import { Program } from "../base/program";
import { Viewport } from "../base/viewport";
import { Renderer3D } from "./visualization/renderer3D";
import { SnakeGame } from "./logic/snakeGame";
import type { BoardParameters, SnakeGameParameters, SnakeParameters, Vector2Int } from "./logic/utils";
import { ChartStepsPerFood } from "./visualization/chartStepsPerFood";
import { ChartSizePerStep } from "./visualization/chartSizePerStep";
import { Time } from "../base/time";
import { ApplicationEvent } from "../base/events";
import { SnakeEvent } from "./logic/events";

const program = new Program();

const head: Vector2Int = { x: 1, y: 2};
const tail: Vector2Int = { x: 1, y: 1};
const initialSnake: Vector2Int[] = [head, tail]

const playerType = [
    HamiltonianCycle, ShortcutHamiltoninanCycle, GetAndBackHamiltonianCycle,
    HybridGetAndBackShortcutHamiltonianCycle, HybridShortcutHamiltonianCycle, HybridGetAndBackHamiltonianCycle,
];
const speeds = [
    75, 75, 75, 75, 75, 75,
];

for (let index = 0; index < playerType.length; index++) {
    const context = program.createContext();

    const snakeParams: SnakeParameters = { speed: speeds[index], initial: initialSnake};
    const gridParams: BoardParameters = { width: 10, height: 10 };
    const snakeGameParams: SnakeGameParameters = {
        snake: snakeParams,
        board: gridParams
    };

    const snakeGame = new SnakeGame(snakeGameParams, new playerType[index]);
    const container = document.getElementById(`container${index}`)!

    const renderer3D = new Viewport(new Renderer3D(snakeGame), container, playerType[index].name);
    const sizePerStep = new Viewport(new ChartSizePerStep(snakeGame), container, "Size Per Step");
    const stepsPerFood = new Viewport(new ChartStepsPerFood(snakeGame), container, "Steps Per Food");
    
    context
        .setApplication(snakeGame)
        .addViewport("three", renderer3D)
        .addViewport("chart1", sizePerStep)
        .addViewport("chart2", stepsPerFood)
        .init();

    Time.lateUpdate.subscribe(event => {
        renderer3D.update();
    })

    Time.lateUpdate.subscribe(event => {
        if (snakeGame.isVictory()) context.applicationEvents.notify(ApplicationEvent.Pause); 
        // if (snakeGame.isDefeat()) context.applicationEvents.notify(ApplicationEvent.Pause); 
    })

    snakeGame.events.subscribe(event => {
        switch (event) {
            case SnakeEvent.MOVED:
                sizePerStep.update();
                break;
            case SnakeEvent.ATE:
                stepsPerFood.update();
                break;
            default:
                break;
        }
    })
}
