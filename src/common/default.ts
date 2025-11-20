import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const canvas = document.getElementById("canvas") as HTMLCanvasElement;
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0.015, 0.015, 0.015);

export const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const header = document.createElement("header");
header.style.position = "fixed";
header.style.top = "0";
header.style.left = "0";
header.style.display = "inline-flex";
header.style.alignItems = "start";
header.style.zIndex = "99";

const link = document.createElement("a");
link.href = "../../index.html";
link.innerText = "BACK";
link.style.background = "rgba(220, 220, 220, 1)";
link.style.color = "black";
link.style.margin = "16px 0px 0px 16px";
link.style.padding = "4px 12px";
link.style.borderRadius = "16px";
link.style.display = "flex";
link.style.alignItems = "center";
link.style.fontFamily = "sans-serif";
link.style.textDecoration = "none";
link.style.fontSize = "12px";

header.appendChild(link);
// document.body.appendChild(header);


camera.name = "MainCamera";
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 1;
camera.lookAt(0, 0, 0);
scene.add(camera)

const renderer = new WebGPURenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls( camera, renderer.domElement );
controls.mouseButtons = {
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.ROTATE,
};

window.addEventListener("resize", onResizeWindow);
canvas.addEventListener("resize", onResizeWindow);

function onResizeWindow() {
	renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.updateProjectionMatrix();
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

const grid = new THREE.GridHelper(10, 10, 0xcccccc, 0x888888);
scene.add(grid);