import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { lerp, randFloat, seededRandom } from "three/src/math/MathUtils.js";
import { BufferAttribute, BufferGeometry, Color, DoubleSide, Float32BufferAttribute, LinearInterpolant, LineSegments, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SphereGeometry, Vector3, WebGPURenderer } from "three/webgpu";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const scene = new Scene();
scene.background = new Color(0x1f1f1f);

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
            [0, []],
            [1, [[0, 1]]],
            [2, [[1, 2]]],
            [3, [[0, 2]]],
            [4, [[2, 3]]],
            [5, [[0, 3], [1, 2]]],
            [6, [[1, 3]]],
            [7, [[3, 0]]],
            [8, [[3, 0]]],
            [9, [[1, 3]]],
            [10, [[0, 1], [2, 3]]],
            [11, [[2, 3]]],
            [12, [[0, 2]]],
            [13, [[1, 2]]],
            [14, [[0, 1]]],
            [15, []],
        ]
    );

    // mesh parameters
    public threshold = 0.5;
    public lowerValue = 0.0;
    public higherValue = 1.0;
    
    // grid parameters
    public cellAmountX = 1;
    public cellAmountY = 1;
    public cellSizeX = 1.0;
    public cellSizeY = 1.0;
    
    // meshes
    public gridPoints: Mesh[][] = [];
    public triangulation: Mesh = new Mesh();

    // debug
    public debugSphereRadius = 0.1;

    private readonly scene: Scene;

    public constructor(scene: Scene) {
        this.scene = scene;

        const api = {
            threshold: this.threshold,
        };

        const gui = new GUI();
        gui.add( api, 'threshold', this.lowerValue, this.higherValue ).step( 0.01 ).onChange( (value) => {
            if(this.threshold === value) return;

            this.threshold = value;
            this.generateMesh();
        });
    }

    public generateGrid(seed?: number): void {
        const geometry = new SphereGeometry(this.debugSphereRadius);
        const material = new MeshBasicMaterial({ color: "red" });

        const halfGridSizeX = this.cellAmountX * this.cellSizeX / 2;
        const halfGridSizeY = this.cellAmountY * this.cellSizeY / 2;
        
        for (let x = 0; x < this.cellAmountX + 1; x++) {
            this.gridPoints[x] = [];

            for (let y = 0; y < this.cellAmountY + 1; y++) {
                const density = Math.random() * (this.higherValue - this.lowerValue) + this.lowerValue;
                const point = new Mesh(geometry, material);

                point.position.x = x * this.cellSizeX - halfGridSizeX;
                point.position.z = y * this.cellSizeY - halfGridSizeY;
                point.position.y = 0;

                point.userData.density = density;

                this.gridPoints[x][y] = point;
                this.scene.add(point);

                this.updateSphereColors(x, y, this.threshold);
            }
        }

    }

    public updateSphereColors(x: number, y: number, threshold: number): void {
        const sphere = this.gridPoints[x][y];
        const density = sphere.userData.density;
        sphere.material = density < threshold ? new MeshBasicMaterial({ color: new Color(0, 0, density)}) : new MeshBasicMaterial({ color: new Color(0, density, 0)});
    }

    public generateMesh(): void {
        const components: number[] = [];

        // this.scene.clear();

        for (let x = 0; x < this.cellAmountX; x++) {
            for (let y = 0; y < this.cellAmountY; y++) {
                const p0 = this.gridPoints[x + 0][y + 0];
                const p1 = this.gridPoints[x + 1][y + 0];
                const p2 = this.gridPoints[x + 1][y + 1];
                const p3 = this.gridPoints[x + 0][y + 1];
                
                const d0 = p0.userData.density;
                const d1 = p1.userData.density;
                const d2 = p2.userData.density;
                const d3 = p3.userData.density;

                const useP0 = d0 > this.threshold ? 1 : 0;
                const useP1 = d1 > this.threshold ? 1 : 0;
                const useP2 = d2 > this.threshold ? 1 : 0;
                const useP3 = d3 > this.threshold ? 1 : 0;

                const index = useP0 | useP1 << 1 | useP2 << 2 | useP3 << 3;
                const edges = this.lookupTable.get(index);

                if (!edges || !edges.length) continue;
                
                console.log("density: ", d0)
                console.log("density: ", d1)
                console.log("density: ", d2)
                console.log("density: ", d3)

                console.log((this.threshold - d0) / (d1 - d0))
                console.log((this.threshold - d1) / (d2 - d1))
                console.log((this.threshold - d2) / (d3 - d2))
                console.log((this.threshold - d3) / (d0 - d3))

                const edgeVertices = [
                    new Vector3().lerpVectors(p0.position.clone(), p1.position.clone(), (this.threshold - d0) / (d1 - d0)),
                    new Vector3().lerpVectors(p1.position.clone(), p2.position.clone(), (this.threshold - d1) / (d2 - d1)),
                    new Vector3().lerpVectors(p2.position.clone(), p3.position.clone(), (this.threshold - d2) / (d3 - d2)),
                    new Vector3().lerpVectors(p3.position.clone(), p0.position.clone(), (this.threshold - d3) / (d0 - d3)),
                ];

                for (const edge of edges) {
                    const v0 = edgeVertices[edge[0]];
                    const v1 = edgeVertices[edge[1]];

                    components.push(...v0.toArray());
                    components.push(...v1.toArray());
                }

                this.updateSphereColors(x, y, this.threshold);
            }
        }


        if (components.length > 0) {
            const buffer = new Float32Array(components);
            const geom = new BufferGeometry();
            geom.setAttribute('position', new Float32BufferAttribute(buffer, 3));
            geom.computeVertexNormals();

            const mat = new MeshBasicMaterial({ color: 'green', side: DoubleSide });
            const mesh = new LineSegments(geom, mat);
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