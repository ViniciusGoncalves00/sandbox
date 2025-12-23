import * as THREE from "three/webgpu";
import { ContextManager } from "./context-manager";

const amount: number = 32;

await ContextManager.createMany(amount).then((contexts) => {
    contexts.forEach((context) => {
        document.body.appendChild(context.container);

        const geometry = new THREE.BoxGeometry(10, 10, 10);
        const materialParameters: THREE.MeshBasicMaterialParameters = {
            color: new THREE.Color("white")
        }
        const material = new THREE.MeshBasicMaterial(materialParameters);
        const mesh = new THREE.Mesh(geometry, material);
        context.scene.add(mesh);

        context.start();
        context.loop.add((deltaTime) => {
            mesh.rotateY(deltaTime * 0.001);
        })
    })

    updateGridLayout(amount)
});

function updateGridLayout(count: number) {
    if (count <= 0) return { cols: 1, rows: 1 };

    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    document.body.classList.remove(
        "grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4",
        "grid-rows-1", "grid-rows-2", "grid-rows-3", "grid-rows-4"
    );

    document.body.classList.add(
        `grid-cols-${cols}`,
        `grid-rows-${rows}`
    );
}