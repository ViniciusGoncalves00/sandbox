import { Program } from "../base/program";
import { Viewport } from "../base/viewport";
import { Example } from "./example";
import { ExampleCanvas2DRenderer } from "./example2DRenderer";
import { ExampleThreeJSRenderer } from "./ExampleThreeJSRenderer";

const example = new Example();

Program.instance()
    .createContext()
    .setApplication(example)
    .setViewport(new Viewport(new ExampleThreeJSRenderer(example), document.getElementById("threeJS")!));

Program.instance()
    .createContext()
    .setApplication(example)
    .setViewport(new Viewport(new ExampleCanvas2DRenderer(example), document.getElementById("canvas2D")!));

// const project = new Application();
// project.register()
// const viewports = project.createViewports(4);
// viewports.forEach(viewport => {
//     viewport.append(document.body);

//     const camera = new THREE.PerspectiveCamera();
//     camera.name = "MainCamera";
//     camera.position.set(10, 10, 10);
//     camera.lookAt(0, 0, 0);

//     camera.fov = 75;
//     camera.aspect = viewport.canvas.width / viewport.canvas.height;
//     camera.near = 0.1;
//     camera.far = 1000;

//     viewport.setActiveCamera(camera);
//     viewport.setScene(scene);
//     viewport.enable();
// });

// updateGridLayout(4)

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