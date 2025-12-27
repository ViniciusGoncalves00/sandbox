import * as THREE from "three"
import { Application } from "../base2/application";
import { Viewport3D, ViewportChart } from "../base2/viewport";
import type { BoardParameters, SnakeGameParameters, SnakeParameters } from "./utils";
import { Human, PseudoHamiltonianCycle, ShortestPath, ShortestValidDirectionImprovedPath, ShortestValidDirectionPath } from "./player";
import { SnakeGame } from "./snakeGame";
import { Chart, type ChartConfiguration } from "chart.js/auto";
import { GameEvent } from "../base2/events";

const playerType = [Human, ShortestValidDirectionPath, ShortestValidDirectionImprovedPath, PseudoHamiltonianCycle];
const speeds = [10, 10, 10, 500];

for (let index = 0; index < playerType.length; index++) {
    const app = new Application();

    const viewport3d = app.register(new Viewport3D());
    viewport3d.enable().append(document.body).setTitle(playerType[index].name);

    const viewportChart = app.register(new ViewportChart());
    viewportChart.enable().append(document.body).setTitle(playerType[index].name)

    const scene = new THREE.Scene();

    const fov = 75;
    const near = 0.1;
    const far = 1000;

    const camera = new THREE.PerspectiveCamera(fov, 0, near, far);
    camera.name = "MainCamera";
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    viewport3d.setActiveCamera(camera).setScene(scene);

    const snakeParams: SnakeParameters = { speed: speeds[index] };
    const gridParams: BoardParameters = { width: 20, height: 20 };
    const snakeGameParams: SnakeGameParameters = {
        snake: snakeParams,
        board: gridParams
    };
    const player = new playerType[index];
    const snake = new SnakeGame(viewport3d, snakeGameParams, player);
    app.register(snake);

    const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Steps to get a food',
                    data: [],
                }
            ]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Food index'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Steps'
                    }
                }
            },
            responsive: false,
            maintainAspectRatio: false,
            devicePixelRatio: window.devicePixelRatio
        }
    };

    viewport3d.gameEvents.subscribe((event) => {
        const dataset = chart.data.datasets[0].data as { x: number; y: number }[];

        switch (event) {
            case GameEvent.ATE:
                dataset.push({
                    x: dataset.length,
                    y: snake.stepsPerFood.at(-1)!
                });
                break;
            
            default:
                break;
        }
    })

    const chart = new Chart(viewportChart.canvas, config);
    viewportChart.setChart(chart);
}

updateGridLayout(playerType.length * 2);

// function updateGridLayout(count: number) {
//     if (count <= 0) return { cols: 1, rows: 1 };

//     const cols = Math.ceil(Math.sqrt(count));
//     const rows = Math.ceil(count / cols);

//     document.body.classList.remove(
//         "grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4",
//         "grid-rows-1", "grid-rows-2", "grid-rows-3", "grid-rows-4"
//     );

//     document.body.classList.add(
//         `grid-cols-${cols}`,
//         `grid-rows-${rows}`
//     );
// }

function updateGridLayout(count: number) {
    if (count <= 0) return { cols: 2, rows: 1 };

    let cols = Math.ceil(Math.sqrt(count));

    // força número par
    if (cols % 2 !== 0) cols++;

    const rows = Math.ceil(count / cols);

    document.body.classList.remove(
        "grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4", "grid-cols-6",
        "grid-rows-1", "grid-rows-2", "grid-rows-3", "grid-rows-4", "grid-rows-6"
    );

    document.body.classList.add(
        `grid-cols-${cols}`,
        `grid-rows-${rows}`
    );

    return { cols, rows };
}
