import type { ChartConfiguration } from "chart.js";
import { ChartJSRenderer } from "../../base/renderer";
import type { SnakeGame } from "../logic/snakeGame";

export class ChartSizePerStep extends ChartJSRenderer<SnakeGame> {
    protected createConfig(): ChartConfiguration {
        return {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Size per step',
                        pointStyle: 'false',
                        pointRadius: 0,
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
                            text: 'Steps'
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Snake Size',
                        },
                        max: this.application.board.size
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
        dataset.data.push({ x: this.application.steps, y: this.application.board.getSnake().length});
    }
}
