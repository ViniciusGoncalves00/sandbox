import type { ChartConfiguration } from "chart.js";
import { ChartJSRenderer } from "../base/renderer";
import type { SnakeGame } from "./snakeGame";

export class ChartStepsPerFood extends ChartJSRenderer<SnakeGame> {
    protected createConfig(): ChartConfiguration {
        return {
            type: 'bar',
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
                        },
                        max: this.application.board.width * this.application.board.height,
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Steps'
                        },
                        max: this.application.board.width * this.application.board.height,
                    }
                },
                responsive: false,
                maintainAspectRatio: false,
                devicePixelRatio: window.devicePixelRatio
            }
        };
    }

    protected updateChart(): void {
        const dataset = this.chart.data.datasets[0];
        const labels = this.chart.data.labels!;

        labels.push("");
        dataset.data.push({ x: dataset.data.length, y: this.application.stepsPerFood.at(-1)!});

        if (dataset.data.length > 200) {
            dataset.data.shift();
            labels.shift();
        }
    }
}
