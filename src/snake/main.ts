// import * as THREE from "three"
// import { Program } from "../base/program";
// import { Viewport3D, ViewportChart } from "../base/viewport";
// import type { BoardParameters, SnakeGameParameters, SnakeParameters, Vector2Int } from "./utils";
import { ShortcutHamiltoninanCycle, Human, HamiltonianCycle, GetAndBackHamiltonianCycle, HybridShortcutHamiltonianCycle, ShortestPath, ShortestValidDirectionImprovedPath, ShortestValidDirectionPath, HybridGetAndBackShortcutHamiltonianCycle, HybridGetAndBackHamiltonianCycle } from "./player";
// import { SnakeGame } from "./snakeGame";
// import { Chart, type ChartConfiguration } from "chart.js/auto";
// import { GameEvent } from "../base/events";
// import { ThreeBoardRenderer } from "./renderer";

import { Program } from "../base/program";
import { Viewport } from "../base/viewport";
import { ExampleOverlay } from "../example/exampleOverlay";
import { renderer3D } from "./renderer3D";
import { SnakeGame } from "./snakeGame";
import type { BoardParameters, SnakeGameParameters, SnakeParameters, Vector2Int } from "./utils";

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

    const snake = new SnakeGame(snakeGameParams, new playerType[index], context.applicationEvents);
    const renderer = new renderer3D(snake);
    const container = document.getElementById(`threeJS${index}`)!;
    const viewport3D = new Viewport(renderer, container);

    context
        .setApplication(snake)
        .setViewport(viewport3D)
        .setOverlay(new ExampleOverlay())
        .overlay()?.build(container).show();
}

updateGrid3ColumnsLayout(playerType.length * 3);

// // function updateGridAdaptativeColumnsLayout(count: number) {
// //     if (count <= 0) return { cols: 1, rows: 1 };

// //     const cols = Math.ceil(Math.sqrt(count));
// //     const rows = Math.ceil(count / cols);

// //     document.body.classList.remove(
// //         "grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4",
// //         "grid-rows-1", "grid-rows-2", "grid-rows-3", "grid-rows-4"
// //     );

// //     document.body.classList.add(
// //         `grid-cols-${cols}`,
// //         `grid-rows-${rows}`
// //     );
// // }

// // function updateGrid2ColumnsLayout(count: number) {
// //     if (count <= 0) return { cols: 2, rows: 1 };

// //     let cols = Math.ceil(Math.sqrt(count));

// //     if (cols % 2 !== 0) cols++;

// //     const rows = Math.ceil(count / cols);

// //     document.body.classList.remove(
// //         "grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4", "grid-cols-6",
// //         "grid-rows-1", "grid-rows-2", "grid-rows-3", "grid-rows-4", "grid-rows-6"
// //     );

// //     document.body.classList.add(
// //         `grid-cols-${cols}`,
// //         `grid-rows-${rows}`
// //     );

// //     return { cols, rows };
// // }

function updateGrid3ColumnsLayout(count: number) {
    if (count <= 0) return { cols: 3, rows: 1 };

    let cols = Math.ceil(Math.sqrt(count));

    // força múltiplo de 3
    cols = Math.ceil(cols / 3) * 3;

    const rows = Math.ceil(count / cols);

    document.body.classList.remove(
        "grid-cols-1", "grid-cols-2", "grid-cols-3",
        "grid-cols-4", "grid-cols-6", "grid-cols-9",
        "grid-rows-1", "grid-rows-2", "grid-rows-3",
        "grid-rows-4", "grid-rows-6", "grid-rows-9"
    );

    document.body.classList.add(
        `grid-cols-${cols}`,
        `grid-rows-${rows}`
    );

    return { cols, rows };
}
