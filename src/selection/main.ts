import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Selector } from "../common/selector";
import { SelectionContext } from "../common/selection-context";
import { Handler } from "../common/handler";

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
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 1;
camera.lookAt(0, 0, 0);
scene.add(camera)
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

function animate() {
    requestAnimationFrame(animate);

    renderer.renderAsync(scene, camera);
}

animate();

const hemisphere = new THREE.HemisphereLight(new THREE.Color("blue"), new THREE.Color("green"), 0.1);
const ambient = new THREE.AmbientLight(new THREE.Color("white"), 0.1);
const directional = new THREE.DirectionalLight(new THREE.Color("white"), 0.5);
directional.position.set(100, 100, -100);
directional.lookAt(0, 0, 0);
scene.add(hemisphere);
scene.add(ambient);
scene.add(directional);

const grid = new THREE.GridHelper();
scene.add(grid);

const geometry = new THREE.SphereGeometry();
const material = new THREE.MeshPhongMaterial();
const mesh0 = new THREE.Mesh(geometry, material);
const mesh1 = mesh0.clone();
const mesh2 = mesh0.clone();
const mesh3 = mesh0.clone();
mesh0.position.set(-3, 0, -3);
mesh1.position.set(-3, 0, +3);
mesh2.position.set(+3, 0, -3);
mesh3.position.set(+3, 0, +3);
scene.add(mesh0, mesh1, mesh2, mesh3);

const selectionContext = new SelectionContext(canvas, camera, [mesh0, mesh1, mesh2, mesh3]);
const selector = new Selector(selectionContext);
const handler = new Handler(scene, selector);

selector.onSelectCallbacks.push(() => handler.handle(selector.current));
selector.onDeselectCallbacks.push(() => handler.handle(selector.current));