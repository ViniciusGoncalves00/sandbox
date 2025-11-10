import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";
import { MathUtils } from "@viniciusgoncalves/ts-utils";
import { PerlinNoise2D } from "./perlin-noise-2D-classic";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0, 0, 0);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.x = -20;
camera.position.y = 50;
camera.position.z = -20;
camera.lookAt(0, 0, 0);
// camera.rotateY(MathUtils.deg2rad(90));

const renderer = new WebGPURenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls( camera, renderer.domElement );

window.addEventListener("resize", onResizeWindow);

function onResizeWindow() {
	renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

const perlinNoise2D = new PerlinNoise2D(scene);
perlinNoise2D.generate();

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
size.add( perlinNoise2D, "gridSizeX", 1, 1000 ).name( "X").step(1).onChange(value => perlinNoise2D.gridSizeX = value);
size.add( perlinNoise2D, "gridSizeZ", 1, 1000 ).name( "Z").step(1).onChange(value => perlinNoise2D.gridSizeZ = value);

const controlNodes = parameters.addFolder("Control Nodes");
const controlNodesCells = controlNodes.addFolder("Cells Amount");
controlNodesCells.add( perlinNoise2D, "controlNodesCellsAmountX", 1, 100, 1).name( "X").onChange(value => perlinNoise2D.controlNodesCellsAmountX = value);
controlNodesCells.add( perlinNoise2D, "controlNodesCellsAmountZ", 1, 100, 1).name( "Z").onChange(value => perlinNoise2D.controlNodesCellsAmountZ = value);
controlNodesCells.add( perlinNoise2D, "randomizeDirection").name( "randomize directions").onChange(value => perlinNoise2D.randomizeDirection = value);

const mesh = parameters.addFolder("Mesh");
const meshCells = mesh.addFolder("Quads Amount");
meshCells.add( perlinNoise2D, "meshCellsAmountX", 1, 1000, 1).name( "X").onChange(value => perlinNoise2D.meshCellsAmountX = value);
meshCells.add( perlinNoise2D, "meshCellsAmountZ", 1, 1000, 1).name( "Z").onChange(value => perlinNoise2D.meshCellsAmountZ = value);

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
debug.add(perlinNoise2D, "showDirectionArrow").name("Show Direction Arrows").onChange((value) => {
    perlinNoise2D.showDirectionArrow = value;
    perlinNoise2D.directionArrows.visible = value;
});

// gui.add( perlinNoise2D, "controlNodeCellSizeX", 0, 0 ).name( "Mesh Cell Size X").disable();
// gui.add( perlinNoise2D, "controlNodeCellSizeX", 0, 0 ).name( "Mesh Cell Size X").disable();

gui.add( perlinNoise2D, "generate").name( "Generate");