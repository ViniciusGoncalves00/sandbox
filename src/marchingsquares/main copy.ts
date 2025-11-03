import { MathUtils, VectorUtils } from "@viniciusgoncalves/ts-utils";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { lerp, randFloat, seededRandom } from "three/src/math/MathUtils.js";
import { BufferAttribute, BufferGeometry, DoubleSide, Float32BufferAttribute, LinearInterpolant, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SphereGeometry, Vector3, WebGPURenderer } from "three/webgpu";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const scene = new Scene();

const camera = new PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 5;
camera.lookAt(0, 0, 0);

const renderer = new WebGPURenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls( camera, renderer.domElement );

function animate() {
  renderer.renderAsync(scene, camera);
  requestAnimationFrame(animate);
}

animate();

class MarchingSquare {
    public readonly lookupTable: Map<number, [number, number][]> = new Map([
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

    public cellAmountX = 10;
    public cellAmountY = 10;
    public cellSizeX = 1;
    public cellSizeY = 1;
    public debugSphereRadius = 0.1;
    public threshold = 0.5;
    public densityGrid: number[][] = [];
    public meshGrid: Mesh[][] = [];

    private readonly scene: Scene;

    public constructor(scene: Scene) {
        this.scene = scene;
    }

    public generateGrid(seed?: number): void {
        if (this.cellAmountX < 1 || this.cellAmountY < 1) {
            console.log("Each size must be greater or equals to 1.");
            return;
        }

        while (this.scene.children.length) this.scene.remove(this.scene.children[0]);

        const halfGridSizeX = this.cellAmountX * this.cellSizeX / 2;
        const halfGridSizeY = this.cellAmountY * this.cellSizeY / 2;

        const geometry = new SphereGeometry(this.debugSphereRadius);
        const red = new MeshBasicMaterial({ color: "red" });
        const blue = new MeshBasicMaterial({ color: "blue" });

        for (let i = 0; i < this.cellAmountX + 1; i++) {
            this.densityGrid[i] = [];
            this.meshGrid[i] = [];
            for (let j = 0; j < this.cellAmountY + 1; j++) {
                const density = randFloat(0.0, 1);
                this.densityGrid[i][j] = density;
            
                const material = density > this.threshold ? red : blue;
                const sphere = new Mesh(geometry, material);
                sphere.userData.density = density;
                sphere.position.x = i * this.cellSizeX - halfGridSizeX;
                sphere.position.z = j * this.cellSizeY - halfGridSizeY;
                sphere.position.y = 0;
                this.meshGrid[i][j] = sphere;
                this.scene.add(sphere);

                console.log(sphere.position)
                console.log(density)
            }
        }
    }

    public generateMesh(): void {
        if (this.cellAmountX < 1 || this.cellAmountY < 1) {
            console.log("Each size must be greater or equals to 1.");
            return;
        }

        const halfGridSizeX = this.cellAmountX * this.cellSizeX / 2;
        const halfGridSizeY = this.cellAmountY * this.cellSizeY / 2;

        const allVertices: number[] = [];

        for (let i = 0; i < this.cellAmountX; i++) {
            for (let j = 0; j < this.cellAmountY; j++) {
                const p0density = this.densityGrid[i][j];
                const p1density = this.densityGrid[i][j + 1];
                const p2density = this.densityGrid[i + 1][j];
                const p3density = this.densityGrid[i + 1][j + 1];

                const useP0 = p0density > this.threshold ? 1 : 0;
                const useP1 = p1density > this.threshold ? 1 : 0;
                const useP2 = p2density > this.threshold ? 1 : 0;
                const useP3 = p3density > this.threshold ? 1 : 0;

                const index = useP0 | (useP1 << 1) | (useP2 << 2) | (useP3 << 3);
                const edgesPairs = this.lookupTable.get(index);
                if (!edgesPairs || !edgesPairs.length) continue;

                const v0 = new Vector3(i * this.cellSizeX - halfGridSizeX, 0, j * this.cellSizeY - halfGridSizeY);
                const v1 = new Vector3(i * this.cellSizeX - halfGridSizeX, 0, (j + 1) * this.cellSizeY - halfGridSizeY);
                const v2 = new Vector3((i + 1) * this.cellSizeX - halfGridSizeX, 0, (j + 1) * this.cellSizeY - halfGridSizeY);
                const v3 = new Vector3((i + 1) * this.cellSizeX - halfGridSizeX, 0, j * this.cellSizeY - halfGridSizeY);
                const vertices = [v0, v1, v2, v3];
                const densities = [p0density, p1density, p2density, p3density];

                const insideAmount = useP0 + useP1 + useP2 + useP3;

                if(insideAmount === 1) {
                    if(useP0 === 1) {
                        const sameX = new Vector3(v0.x, 0, 0);
                        const sameZ = new Vector3(0, 0, v0.z);

                        sameX.z = MathUtils.lerp(v0.z, v2.z, p2density);
                        sameZ.x = MathUtils.lerp(v0.x, v1.x, p1density);

                        allVertices.push(...v0.toArray());
                        allVertices.push(...sameZ.toArray());
                        allVertices.push(...sameX.toArray());
                    } else if(useP1 === 1) {
                        const sameX = new Vector3(v1.x, 0, 0);
                        const sameZ = new Vector3(0, 0, v1.z);

                        sameX.z = MathUtils.lerp(v1.z, v3.z, p3density);
                        sameZ.x = MathUtils.lerp(v1.x, v0.x, p0density);

                        allVertices.push(...v1.toArray());
                        allVertices.push(...sameX.toArray());
                        allVertices.push(...sameZ.toArray());
                    } else if(useP2 === 1) {
                        const sameX = new Vector3(v2.x, 0, 0);
                        const sameZ = new Vector3(0, 0, v2.z);

                        sameX.z = MathUtils.lerp(v2.z, v0.z, p0density);
                        sameZ.x = MathUtils.lerp(v2.x, v3.x, p3density);

                        allVertices.push(...v2.toArray());
                        allVertices.push(...sameX.toArray());
                        allVertices.push(...sameZ.toArray());
                    } else if(useP3 === 1) {
                        const sameX = new Vector3(v3.x, 0, 0);
                        const sameZ = new Vector3(0, 0, v3.z);

                        sameX.z = MathUtils.lerp(v3.z, v2.z, p2density);
                        sameZ.x = MathUtils.lerp(v3.x, v1.x, p1density);

                        allVertices.push(...v3.toArray());
                        allVertices.push(...sameZ.toArray());
                        allVertices.push(...sameX.toArray());
                    }
                } else if (insideAmount === 2) {

                } else if (insideAmount === 3) {

                }
            }
        }

        if (allVertices.length > 0) {
            const buffer = new Float32Array(allVertices);
            const geom = new BufferGeometry();
            geom.setAttribute('position', new Float32BufferAttribute(buffer, 3));
            geom.computeVertexNormals();

            const mat = new MeshBasicMaterial({ color: 'green', side: DoubleSide });
            const mesh = new Mesh(geom, mat);
            this.scene.add(mesh);
        }
    }   
}

const marchingSquare = new MarchingSquare(scene);
marchingSquare.generateGrid();
marchingSquare.generateMesh();

window.addEventListener("resize", onResizeWindow);

function onResizeWindow() {
	renderer.setSize(window.innerWidth, window.innerHeight);
}