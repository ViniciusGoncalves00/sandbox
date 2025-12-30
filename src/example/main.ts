import { Program } from "../base/program";
import { Viewport } from "../base/viewport";
import { Example } from "./example";
import { ExampleCanvas2DRenderer } from "./example2DRenderer";
import { ExampleChartJSRenderer } from "./exampleChartJSRenderer";
import { ExampleThreeJSRenderer } from "./ExampleThreeJSRenderer";

const example = new Example();

const program = new Program();

program
    .createContext()
    .setApplication(example)
    .setViewport(new Viewport(new ExampleThreeJSRenderer(example), document.getElementById("threeJS")!));

program
    .createContext()
    .setApplication(example)
    .setViewport(new Viewport(new ExampleCanvas2DRenderer(example), document.getElementById("canvas2D")!));

program
    .createContext()
    .setApplication(example)
    .setViewport(new Viewport(new ExampleChartJSRenderer(example), document.getElementById("chartJS")!));