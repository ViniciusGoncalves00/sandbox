import { Program } from "../base/program";
import { ExampleOverlay } from "./exampleOverlay";
import { Viewport } from "../base/viewport";
import { Example } from "./example";
import { ExampleThreeJSRenderer } from "./exampleThreeJSRenderer";
import { ExampleCanvas2DRenderer } from "./example2DRenderer";
import { ExampleChartJSRenderer } from "./exampleChartJSRenderer";
import { Time } from "../base/time";

const app = new Example();
const container = document.getElementById("container")!

const program = new Program();
const context = program.createContext();

const renderer3D = new Viewport(new ExampleThreeJSRenderer(app), container, "Three JS");
const renderer2D = new Viewport(new ExampleCanvas2DRenderer(app), container, "Canvas 2D");
const chart      = new Viewport(new ExampleChartJSRenderer(app), container, "Chart JS");

context
    .setApplication(app)
    .setOverlay(new ExampleOverlay(container))
    .addViewport("threeJS", renderer3D)
    .addViewport("canvas2D", renderer2D)
    .addViewport("chartJS", chart)
    .init();

Time.lateUpdate.subscribe(event => {
    renderer3D.update();
    renderer2D.update();
    chart.update();
})