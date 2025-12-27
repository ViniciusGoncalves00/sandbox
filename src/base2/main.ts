import * as THREE from "three"
import { Application } from "./application";
import { Viewport3D, ViewportChart } from "./viewport";
import Chart, { type ChartConfiguration } from 'chart.js/auto'
import type { BoardParameters, SnakeGameParameters, SnakeParameters } from "../snake/utils";
import { PseudoHamiltonianCycle, ShortestValidDirectionImprovedPath } from "../snake/player";
import { SnakeGame } from "../snake/snakeGame";
import { GameEvent } from "./events";

const app = new Application();

const v3d = app.register(new Viewport3D());
v3d.enable();
v3d.append(document.body);

const vChart = app.register(new ViewportChart());
vChart.append(document.body);
vChart.enable();

const scene = new THREE.Scene();

const fov = 75;
const near = 0.1;
const far = 1000;

const camera = new THREE.PerspectiveCamera(fov, 0, near, far);
camera.name = "MainCamera";
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

v3d.setActiveCamera(camera);
v3d.setScene(scene);

const snakeParams: SnakeParameters = { speed: 2000 };
const gridParams: BoardParameters = { width: 20, height: 20 };
const snakeGameParams: SnakeGameParameters = {
    snake: snakeParams,
    board: gridParams
};
const player = new PseudoHamiltonianCycle();
const snake = new SnakeGame(v3d, snakeGameParams, player);
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
        }
    }
};

v3d.gameEvents.subscribe((event) => {
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

const chart = new Chart(vChart.canvas, config);
vChart.setChart(chart);

updateGridLayout(2)

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