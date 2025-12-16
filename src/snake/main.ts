import { BoxGeometry, Color, Mesh, MeshPhongMaterial, PerspectiveCamera, Scene, Timer, Vector2 } from "three";
import { WebGPURenderer } from "three/webgpu";
import { App, type ViewParameters } from "./base/app";
import { degToRad } from "three/src/math/MathUtils.js";
import { SnakeGame } from "./snakeGame";
import type { BoardParameters, SnakeGameParameters, SnakeParameters } from "./utils";
import { Loop } from "./base/loop";
import { UI } from "./ui";
import { GameController } from "./base/appManager";
import { InputHandler } from "./input-handler";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const scene = new Scene();
scene.background = new Color(0.015, 0.015, 0.015);

const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.name = "MainCamera";
camera.position.y = 10;
camera.lookAt(0, 0, 0);
camera.rotateZ(-degToRad(180));
scene.add(camera);

const renderer = new WebGPURenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", onResizeWindow);
canvas.addEventListener("resize", onResizeWindow);

function onResizeWindow() {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.updateProjectionMatrix();
}

const viewParams: ViewParameters = { renderer, camera, scene, canvas };

UI.getInstance();
new GameController(viewParams);