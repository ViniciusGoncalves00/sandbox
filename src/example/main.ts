import { Program } from "../base/program";
import { ExampleOverlay } from "./exampleOverlay";
import { Viewport } from "../base/viewport";
import { Example } from "./example";
import { ExampleThreeJSRenderer } from "./exampleThreeJSRenderer";
import { ExampleCanvas2DRenderer } from "./example2DRenderer";
import { ExampleChartJSRenderer } from "./exampleChartJSRenderer";

const app = new Example();
const container = document.getElementById("container")!

const program = new Program();
const context = program.createContext();

context
    .setApplication(app)
    .setOverlay(new ExampleOverlay(container))
    .addViewport("threeJS", new Viewport(new ExampleThreeJSRenderer(app), container, "Three JS"))
    .addViewport("canvas2D", new Viewport(new ExampleCanvas2DRenderer(app), container, "Canvas 2D"))
    .addViewport("chartJS", new Viewport(new ExampleChartJSRenderer(app), container, "chart JS"))
    .init();