import { BoxGeometry, Color, Mesh, MeshPhongMaterial, PerspectiveCamera, Scene, Timer, Vector2 } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { WebGPURenderer } from "three/webgpu";
import { Game } from "./game";
import { degToRad } from "three/src/math/MathUtils.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const scene = new Scene();
scene.background = new Color(0.015, 0.015, 0.015);

export const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.name = "MainCamera";
camera.position.y = 10;
camera.lookAt(0, 0, 0);
camera.position.x = 5;
camera.position.z = 5;
camera.rotateZ(degToRad(180));
scene.add(camera);

const renderer = new WebGPURenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", onResizeWindow);
canvas.addEventListener("resize", onResizeWindow);

function onResizeWindow() {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.updateProjectionMatrix();
}

const game = new Game(renderer, camera, scene, canvas);
game.start();