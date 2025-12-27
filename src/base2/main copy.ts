// import * as THREE from "three"
// import { Application } from "./application";

// const geometry = new THREE.BoxGeometry(10, 10, 10);
// const materialParameters: THREE.MeshBasicMaterialParameters = {
//     color: new THREE.Color("white")
// }
// const material = new THREE.MeshBasicMaterial(materialParameters);
// const mesh = new THREE.Mesh(geometry, material);

// const scene = new THREE.Scene();
// scene.add(mesh);

// const project = new Application();
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