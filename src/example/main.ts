import { Program } from "../base/program";
import { ExampleOverlay } from "./exampleOverlay";
import { Viewport } from "../base/viewport";
import { Example } from "./example";
import { ExampleThreeJSRenderer } from "./exampleThreeJSRenderer";
import { ExampleCanvas2DRenderer } from "./example2DRenderer";
import { ExampleChartJSRenderer } from "./exampleChartJSRenderer";

const program = new Program();

const app = new Example();

const threeJSRenderer = new ExampleThreeJSRenderer(app);
const threeJSviewport = new Viewport(threeJSRenderer, document.getElementById("threeJS")!);

const canvas2DRenderer = new ExampleCanvas2DRenderer(app);
const canvas2Dviewport = new Viewport(canvas2DRenderer, document.getElementById("canvas2D")!);

const exampleChartJSRenderer = new ExampleChartJSRenderer(app);
const exampleChartJSviewport = new Viewport(exampleChartJSRenderer, document.getElementById("chartJS")!);

program.createContext()
    .setApplication(app)
    .setViewport(threeJSviewport)
    .setOverlay(new ExampleOverlay())
    .overlay()?.build(document.getElementById("threeJS")!).show();

program.createContext()
    .setApplication(app)
    .setViewport(canvas2Dviewport)
    .setOverlay(new ExampleOverlay())
    .overlay()?.build(document.getElementById("canvas2D")!).show();

program.createContext()
    .setApplication(app)
    .setViewport(exampleChartJSviewport)
    .setOverlay(new ExampleOverlay())
    .overlay()?.build(document.getElementById("chartJS")!).show();
