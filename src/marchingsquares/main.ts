import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { WebGPURenderer } from "three/webgpu";
import { Grid } from "./grid";
import { MathUtils } from "@viniciusgoncalves/ts-utils";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0, 0, 0);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = -5;
camera.lookAt(0, 0, 0);
camera.rotateZ(MathUtils.deg2rad(-90));

const renderer = new WebGPURenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", onResizeWindow);

function onResizeWindow() {
	renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

function animate() {
  renderer.renderAsync(scene, camera);
  requestAnimationFrame(animate);
}

animate();

const lookupTable: Map<number, [number, number][]> = new Map([
        [0, []],                // 0000
        [1, [[0, 3]]],          // 0001
        [2, [[0, 1]]],          // 0010
        [3, [[1, 3]]],          // 0011
        [4, [[1, 2]]],          // 0100
        [5, [[0, 1], [2, 3]]],  // 0101
        [6, [[0, 2]]],          // 0110
        [7, [[2, 3]]],          // 0111
        [8, [[2, 3]]],          // 1000
        [9, [[0, 2]]],          // 1001
        [10, [[0, 3], [1, 2]]], // 1010
        [11, [[1, 2]]],         // 1011
        [12, [[1, 3]]],         // 1100
        [13, [[0, 1]]],         // 1101
        [14, [[0, 3]]],         // 1110
        [15, []]                // 1111
    ]
);

const materialSelected = new THREE.MeshBasicMaterial( { color: new THREE.Color(0.9, 0.9, 0.9)});
const materialUnselected = new THREE.MeshBasicMaterial( { color: new THREE.Color(0.1, 0.1, 0.1)});

const forward = new THREE.Vector3();
camera.getWorldDirection(forward);

const raycaster = new THREE.Raycaster(camera.position, forward);

canvas.addEventListener("click", (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();

    const normalized_coordinates = new THREE.Vector2();
    normalized_coordinates.x = ((event.x - rect.left) / rect.width) * 2 - 1;
    normalized_coordinates.y = -((event.y - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(normalized_coordinates.x, normalized_coordinates.y), camera);

    const intersections = raycaster.intersectObjects(scene.children);
    if (!intersections || intersections.length === 0) {
        return
    }

    const object = intersections[0].object as THREE.Mesh;

    if(object.userData.use) {
        object.userData.use = false;
        object.material = materialUnselected;
    } else {
        object.userData.use = true;
        object.material = materialSelected;
    }
})

const grid = new Grid(scene);
grid.generateGrid(20, 20);
grid.randomizeDensity(0, 1);
grid.updateConfiguration(0.5);
grid.drawGrid();

// function generateTriangles() {
//     const buffer = new Float32Array(allVertices);
//     const geometry = new THREE.BufferGeometry();
//     geometry.setAttribute('position', new THREE.Float32BufferAttribute(buffer, 3));
//     geometry.computeVertexNormals();
    
//     const material = new THREE.MeshBasicMaterial({ color: 'green', side: THREE.DoubleSide });
//     const mesh = new THREE.Mesh(geometry, material);
//     scene.add(mesh);
// }