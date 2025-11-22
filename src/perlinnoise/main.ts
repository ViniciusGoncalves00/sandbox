import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";
import { MathUtils } from "@viniciusgoncalves/ts-utils";
import { PerlinNoise2D } from "./perlin-noise-2D-classic";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { SelectionContext } from "../common/selection-context";
import { Selector } from "../common/selector";
import { Handler } from "../handler/handler";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0, 0, 0);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.name = "MainCamera";
camera.position.x = -20;
camera.position.y = 50;
camera.position.z = -20;
camera.lookAt(0, 0, 0);
scene.add(camera);
// camera.rotateY(MathUtils.deg2rad(90));

const renderer = new WebGPURenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls( camera, renderer.domElement );
controls.mouseButtons = {
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.ROTATE,
};

window.addEventListener("resize", onResizeWindow);

function onResizeWindow() {
	renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}


const selectionContext = new SelectionContext(canvas, camera);
const selector = new Selector(selectionContext);
const handler = new Handler(scene, selector);
const perlinNoise2D = new PerlinNoise2D(scene, selector);
// perlinNoise2D.generate();

function animate() {
    requestAnimationFrame(animate);

    renderer.renderAsync(scene, camera);
}

animate();

const gui = new GUI();
gui.title("Configuration");

const parameters = gui.addFolder("Parameters");
const debug = gui.addFolder("Debug");


const grid = parameters.addFolder("Grid");
const size = grid.addFolder("Size");
size.add( perlinNoise2D, "gridSizeX").name("X").min(1).max(100).step(1).onChange(value => perlinNoise2D.gridSizeX = value);
size.add( perlinNoise2D, "gridSizeZ").name("Z").min(1).max(100).step(1).onChange(value => perlinNoise2D.gridSizeZ = value);

const controlNodes = parameters.addFolder("Control Nodes");
const controlNodesAmount = controlNodes.addFolder("Amount");
controlNodesAmount.add( perlinNoise2D, "controlNodesAmountX").name("X").min(2).max(100).step(1).onChange(value => perlinNoise2D.controlNodesAmountX = value);
controlNodesAmount.add( perlinNoise2D, "controlNodesAmountZ").name("Z").min(2).max(100).step(1).onChange(value => perlinNoise2D.controlNodesAmountZ = value);
controlNodesAmount.add( perlinNoise2D, "needRandomizeDirection").name( "randomize directions").onChange(value => perlinNoise2D.needRandomizeDirection = value);

const mesh = parameters.addFolder("Mesh");
const meshVerticesAmount = mesh.addFolder("Amount");
meshVerticesAmount.add( perlinNoise2D, "meshResolutionX").name("X").min(1).max(1000).step(1).onChange(value => perlinNoise2D.meshResolutionX = value);
meshVerticesAmount.add( perlinNoise2D, "meshResolutionZ").name("Z").min(1).max(1000).step(1).onChange(value => perlinNoise2D.meshResolutionZ = value);

const transformation = parameters.addFolder("Transformation");
const scale = transformation.addFolder("Scale");
// scale.add(perlinNoise2D.mesh.scale, "x", -1, 1, 0.1).onChange((value: number) => perlinNoise2D.mesh.scale.setX(value));
scale.add(perlinNoise2D.mesh.scale, "y", -1, 1, 0.1).onChange((value: number) => perlinNoise2D.mesh?.scale.setY(value));
// scale.add(perlinNoise2D.mesh.scale, "z", -1, 1, 0.1).onChange((value: number) => perlinNoise2D.mesh?.scale.setZ(value));

// const controlNodeCellSizeX = gui.add( perlinNoise2D, "controlNodeCellSizeX", 0, 0 ).name( "Mesh Cell Size X").disable().updateDisplay();
// const controlNodeCellSizeZ = gui.add( perlinNoise2D, "controlNodeCellSizeZ", 0, 0 ).name( "Mesh Cell Size Z").disable().updateDisplay();
// const meshCellSizeX = gui.add( perlinNoise2D, "meshCellSizeX", 0, 0 ).name( "Mesh Cell Size Z").disable().updateDisplay();
// const meshCellSizeZ = gui.add( perlinNoise2D, "meshCellSizeZ", 0, 0 ).name( "Mesh Cell Size Z").disable().updateDisplay();

debug.add(perlinNoise2D, "showControlNodes").name("Show Control Nodes").onChange((value) => {
    perlinNoise2D.showControlNodes = value;
    perlinNoise2D.controlGridSpheres.visible = value;
});
// debug.add(perlinNoise2D, "controlNodeSize", 1, 2).name("Control Node Size").onChange((value) => {
//     perlinNoise2D.controlNodeSize = value;
//     perlinNoise2D.sphereGeometry.scale(value, value, value);
// });

// gui.add( perlinNoise2D, "controlNodeCellSizeX", 0, 0 ).name( "Mesh Cell Size X").disable();
// gui.add( perlinNoise2D, "controlNodeCellSizeX", 0, 0 ).name( "Mesh Cell Size X").disable();

gui.add( perlinNoise2D, "updateControlGrid").name( "updateControlGrid");
gui.add( perlinNoise2D, "updateMesh").name( "updateMesh");
gui.add( perlinNoise2D, "randomizeDirections").name( "randomizeDirections");

handler.afterTransformate.push(() => {
    if(!selector.current) return;

    const uuid = (selector.current as unknown as THREE.Mesh).uuid;
    perlinNoise2D.updateNodeDirection(uuid);
    perlinNoise2D.updateMesh();
});

selector.onSelectCallbacks.push(() => handler.handle(selector.current));
selector.onDeselectCallbacks.push(() => handler.handle(selector.current));