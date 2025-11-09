import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";
import { MathUtils } from "@viniciusgoncalves/ts-utils";
import { PerlinNoise2D } from "./perlin-noise-2D-classic";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0, 0, 0);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.x = -50;
camera.position.y = 50;
camera.position.z = -50;
camera.lookAt(0, 0, 0);
// camera.rotateY(MathUtils.deg2rad(90));

const renderer = new WebGPURenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls( camera, renderer.domElement );

window.addEventListener("resize", onResizeWindow);

function onResizeWindow() {
	renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

const sizeX = 100;
const sizeY = 100;
const perlinNoise2D = new PerlinNoise2D(scene);


let lastMeshUpdate = 0;
const meshUpdateInterval = 200;

function animate(time: number) {
    requestAnimationFrame(animate);

    renderer.renderAsync(scene, camera);

    if (time - lastMeshUpdate >= meshUpdateInterval) {
        lastMeshUpdate = time;

        scene.clear();
        perlinNoise2D.generateControlGrid(sizeX, sizeY);
        perlinNoise2D.generateMesh(sizeX, sizeY);
        perlinNoise2D.centralize();
    }
}

animate(0);