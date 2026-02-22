import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { SelectionContext } from "../common/selection-context";
import { Handler } from "../handler/handler";
import { Terrain } from "./terrain";
import { Selector } from "../common/selector";
import type { ISelectable } from "../common/interfaces/ISelectable";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0.9, 0.9, 0.9);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

scene.add(camera);

camera.name = "MainCamera";
camera.position.set(-80, 80, -80);
camera.lookAt(50, 50, 50);

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
const selector = new Selector(canvas, camera);
const handler = new Handler(scene, selector);
const terrain = new Terrain(scene, selector);
terrain.updateControlGrid();
terrain.randomizeDirections();
terrain.updateMesh();

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
size.add( terrain, "gridSizeX").name("X").min(1).max(1000).step(1).onChange(value => terrain.gridSizeX = value);
size.add( terrain, "gridSizeZ").name("Z").min(1).max(1000).step(1).onChange(value => terrain.gridSizeZ = value);

const controlNodes = parameters.addFolder("Control Nodes");
const controlNodesAmount = controlNodes.addFolder("Amount");
controlNodesAmount.add( terrain, "controlNodesAmountX").name("X").min(2).max(100).step(1).onChange(value => terrain.controlNodesAmountX = value);
controlNodesAmount.add( terrain, "controlNodesAmountZ").name("Z").min(2).max(100).step(1).onChange(value => terrain.controlNodesAmountZ = value);
controlNodes.add( terrain, "updateControlGrid").name( "Update Control Grid");
// controlNodesAmount.add( terrain, "needRandomizeDirection").name( "randomize directions").onChange(value => terrain.needRandomizeDirection = value);


const mesh = parameters.addFolder("Mesh");
const meshVerticesAmount = mesh.addFolder("Amount");
meshVerticesAmount.add( terrain, "quadResolutionX").name("X").min(1).max(1000).step(1).onChange(value => terrain.quadResolutionX = value);
meshVerticesAmount.add( terrain, "quadResolutionZ").name("Z").min(1).max(1000).step(1).onChange(value => terrain.quadResolutionZ = value);
mesh.add( terrain, "updateMesh").name( "Update Mesh");


const transformation = parameters.addFolder("Transformation");
const scale = transformation.addFolder("Scale");
// scale.add(terrain.mesh.scale, "x", -1, 1, 0.1).onChange((value: number) => terrain.mesh.scale.setX(value));
scale.add(terrain.mesh.scale, "y", -1, 1, 0.1).onChange((value: number) => terrain.mesh?.scale.setY(value));
// scale.add(terrain.mesh.scale, "z", -1, 1, 0.1).onChange((value: number) => terrain.mesh?.scale.setZ(value));

// const controlNodeCellSizeX = gui.add( terrain, "controlNodeCellSizeX", 0, 0 ).name( "Mesh Cell Size X").disable().updateDisplay();
// const controlNodeCellSizeZ = gui.add( terrain, "controlNodeCellSizeZ", 0, 0 ).name( "Mesh Cell Size Z").disable().updateDisplay();
// const meshCellSizeX = gui.add( terrain, "meshCellSizeX", 0, 0 ).name( "Mesh Cell Size Z").disable().updateDisplay();
// const meshCellSizeZ = gui.add( terrain, "meshCellSizeZ", 0, 0 ).name( "Mesh Cell Size Z").disable().updateDisplay();

debug.add(terrain, "showControlNodes").name("Show Control Nodes").onChange((value) => {
    terrain.showControlNodes = value;
    terrain.controlGridSpheres.visible = value;
});
// debug.add(terrain, "controlNodeSize", 1, 2).name("Control Node Size").onChange((value) => {
//     terrain.controlNodeSize = value;
//     terrain.sphereGeometry.scale(value, value, value);
// });

// gui.add( terrain, "controlNodeCellSizeX", 0, 0 ).name( "Mesh Cell Size X").disable();
// gui.add( terrain, "controlNodeCellSizeX", 0, 0 ).name( "Mesh Cell Size X").disable();

gui.add( terrain, "randomizeDirections").name( "randomizeDirections");

handler.afterTransformate.push(() => {
    // if(!selector.current) return;

    // selector.selection.forEach(element => {
    //     terrain.updateNodeDirection(element.uuid);
    // });
    terrain.updateMesh();
});

selector.onAddToSelection.push((object) => handler.handle(object as unknown as ISelectable))
selector.onRemoveFromSelection.push((object) => handler.handle(object as unknown as ISelectable))
// selector.onSelectCallbacks.push(() => handler.handle(selector.current));
// selector.onDeselectCallbacks.push(() => handler.handle(selector.current));