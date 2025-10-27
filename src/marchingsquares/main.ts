import { randFloat, seededRandom } from "three/src/math/MathUtils.js";
import { BufferGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SphereGeometry, Vector3, WebGPURenderer } from "three/webgpu";

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

    public gridX = 10;
    public gridY = 10;
    public sizeX = 3;
    public sizeY = 3;
    public debugSphereRadius = 0.1;
    public threshold = 0.5;
    public densityGrid: number[][] = [];

    private readonly scene: Scene;

    public constructor(scene: Scene) {
        this.scene = scene;
    }

    public generate(seed?: number): void {
        if(this.gridX < 1 || this.gridY < 1) {
		    console.log("Each size must be greater or equals to 1.");
		    return;
	    }

        this.scene.clear();

        const halfX = this.gridX * this.sizeX / 2;
        const halfY = this.gridY * this.sizeY / 2;

        const geometry = new SphereGeometry(this.debugSphereRadius);
        const red = new MeshBasicMaterial({ color: "red" });
        const blue = new MeshBasicMaterial({ color: "blue" });

        for (let i = 0; i < this.gridX + 1; i++) {
            this.densityGrid[i] = [];

            for (let j = 0; j < this.gridY + 1; j++) {
                const density = randFloat(0, 1);
                this.densityGrid[i][j] = density;

                const material = density > this.threshold ? red : blue;

                const sphere = new Mesh(geometry, material);
                sphere.name = density.toString();

                sphere.position.x = i * this.sizeX - halfX;
                sphere.position.z = j * this.sizeY - halfY;

                this.scene.add(sphere);
            }
        }

        for (let i = 0; i < this.gridX; i++) {
            for (let j = 0; j < this.gridY; j++) {
                const p0 = this.densityGrid[i][j];
                const p1 = this.densityGrid[i][j + 1];
                const p2 = this.densityGrid[i + 1][j];
                const p3 = this.densityGrid[i + 1][j + 1];

        const useP0 = p0 > this.threshold ? 1 : 0;
        const useP1 = p1 > this.threshold ? 1 : 0;
        const useP2 = p2 > this.threshold ? 1 : 0;
        const useP3 = p3 > this.threshold ? 1 : 0;

                const index = useP0 | (useP1 << 1) | (useP2 << 2) | (useP3 << 3);

        const edges = this.lookupTable.get(index);
        if(!edges) continue;
        if (!edges.length) continue;

        const positions = [
            new Vector3(i * this.sizeX - halfX, 0, j * this.sizeY - halfY),         // v0
            new Vector3(i * this.sizeX - halfX, 0, (j+1) * this.sizeY - halfY),     // v1
            new Vector3((i+1) * this.sizeX - halfX, 0, (j+1) * this.sizeY - halfY), // v2
            new Vector3((i+1) * this.sizeX - halfX, 0, j * this.sizeY - halfY),     // v3
        ];

        // Calcular os pontos de interseção das arestas
const edgePoints: Vector3[] = [];

for (const edge of edges) {
    const [eStart, eEnd] = edge;
    const lerpEdge = (a: number, b: number) => {
        const da = [p0, p1, p2, p3][a];
        const db = [p0, p1, p2, p3][b];
        const t = (this.threshold - da) / (db - da);
        return positions[a].clone().lerp(positions[b], t);
    };
    edgePoints.push(lerpEdge(eStart, eEnd));
}

// Se tiver 2 pontos, criar linha simples
if (edgePoints.length === 2) {
    const geom = new BufferGeometry();
    const verts = [
        edgePoints[0].x, 0, edgePoints[0].z,
        edgePoints[1].x, 0, edgePoints[1].z,
        (edgePoints[0].x + edgePoints[1].x)/2, 0.1, (edgePoints[0].z + edgePoints[1].z)/2 // leve elevação
    ];
    geom.setAttribute("position", new Float32BufferAttribute(verts, 3));
    geom.computeVertexNormals();
    const mesh = new Mesh(geom, new MeshBasicMaterial({ color: "green" }));
    this.scene.add(mesh);
}

// Se tiver 4 pontos (quadrilátero), criar 2 triângulos
if (edgePoints.length === 4) {
    const geom = new BufferGeometry();
    const verts = [
        // Triângulo 1
        edgePoints[0].x, 0, edgePoints[0].z,
        edgePoints[1].x, 0, edgePoints[1].z,
        edgePoints[2].x, 0, edgePoints[2].z,
        // Triângulo 2
        edgePoints[0].x, 0, edgePoints[0].z,
        edgePoints[2].x, 0, edgePoints[2].z,
        edgePoints[3].x, 0, edgePoints[3].z,
    ];
    geom.setAttribute("position", new Float32BufferAttribute(verts, 3));
    geom.computeVertexNormals();
    const mesh = new Mesh(geom, new MeshBasicMaterial({ color: "green" }));
    this.scene.add(mesh);
            }
        }}
    }
}

const marchingSquare = new MarchingSquare(scene);
marchingSquare.generate();

window.addEventListener("resize", onResizeWindow);

function onResizeWindow() {
	renderer.setSize(window.innerWidth, window.innerHeight);
}