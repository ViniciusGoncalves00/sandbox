import type { ChartConfiguration } from "chart.js";
import type { Example } from "./example";
import { ChartJSRenderer } from "../base/renderer";

export class ExampleChartJSRenderer extends ChartJSRenderer<Example> {
    protected createConfig(): ChartConfiguration {
        return {
            type: "line",
            data: {
                labels: [],
                datasets: [
                    {
                        label: "Wave",
                        data: [],
                        borderColor: "white",
                        radius: 0,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    x: { display: false },
                    y: {
                        min: 0,
                        max: 1
                    }
                }
            }
        };
    }

    protected updateChart(): void {
        const dataset = this.chart.data.datasets[0];
        const labels = this.chart.data.labels!;

        labels.push("");
        dataset.data.push(this.application.value);

        if (dataset.data.length > 200) {
            dataset.data.shift();
            labels.shift();
        }
    }
}
