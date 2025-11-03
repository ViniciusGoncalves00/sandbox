import { MathUtils, VectorUtils } from "@viniciusgoncalves/ts-utils";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
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
    // mesh parameters
    public threshold = 0.5;
    public lowerValue = 0.0;
    public higherValue = 1.0;
    
    // grid parameters
    public cellAmountX = 50;
    public cellAmountY = 50;
    public cellSizeX = .2;
    public cellSizeY = .2;
    
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
        const material = new MeshBasicMaterial({ color: "white" });

        const halfGridSizeX = this.cellAmountX * this.cellSizeX / 2;
        const halfGridSizeY = this.cellAmountY * this.cellSizeY / 2;
        
        for (let x = 0; x < this.cellAmountX + 1; x++) {
            this.gridPoints[x] = [];

            for (let y = 0; y < this.cellAmountY + 1; y++) {
                const density = MathUtils.randomRange(this.lowerValue, this.higherValue);
                const point = new Mesh(geometry, material);

                point.position.x = x * this.cellSizeX - halfGridSizeX;
                point.position.z = y * this.cellSizeY - halfGridSizeY;
                point.position.y = 0;

                point.userData.density = density;

                this.gridPoints[x][y] = point;
                this.scene.add(point);
            }
        }
    }

    public generateMesh(): void {
        const components = [];

        this.scene.clear();

        const red = new MeshBasicMaterial({ color: "red" });
        const blue = new MeshBasicMaterial({ color: "blue" });

        for (let x = 0; x < this.cellAmountX; x++) {
            for (let y = 0; y < this.cellAmountY; y++) {
                if(this.gridPoints[x + 0][y + 0].userData.density > this.threshold) {
                    const current = this.gridPoints[x + 0][y + 0];
                    current.material = red;
                    components.push(...current.position.toArray());

                    const v1 = this.gridPoints[x + 1][y + 0].clone();
                    v1.position.x = MathUtils.lerp(current.position.x, v1.position.x, v1.userData.density);
                    components.push(...v1.position.toArray());

                    const v2 = this.gridPoints[x + 0][y + 1].clone();
                    v2.position.x = MathUtils.lerp(current.position.x, v2.position.x, v2.userData.density);
                    components.push(...v2.position.toArray());
                } else {
                    this.gridPoints[x + 0][y + 0].material = blue;
                }

                if(this.gridPoints[x + 1][y + 0].userData.density > this.threshold) {
                    const current = this.gridPoints[x + 1][y + 0];
                    current.material = red;
                    components.push(...current.position.toArray());

                    const v1 = this.gridPoints[x + 1][y + 1].clone();
                    v1.position.x = MathUtils.lerp(current.position.x, v1.position.x, v1.userData.density);
                    components.push(...v1.position.toArray());

                    const v2 = this.gridPoints[x + 0][y + 0].clone();
                    v2.position.x = MathUtils.lerp(current.position.x, v2.position.x, v2.userData.density);
                    components.push(...v2.position.toArray());
                } else {
                    this.gridPoints[x + 1][y + 0].material = blue;
                }
                
                if(this.gridPoints[x + 0][y + 1].userData.density > this.threshold) {
                    const current = this.gridPoints[x + 0][y + 1];
                    current.material = red;
                    components.push(...current.position.toArray());

                    const v1 = this.gridPoints[x + 0][y + 0].clone();
                    v1.position.x = MathUtils.lerp(current.position.x, v1.position.x, v1.userData.density);
                    components.push(...v1.position.toArray());

                    const v2 = this.gridPoints[x + 1][y + 1].clone();
                    v2.position.x = MathUtils.lerp(current.position.x, v2.position.x, v2.userData.density);
                    components.push(...v2.position.toArray());
                } else {
                    this.gridPoints[x + 0][y + 1].material = blue;
                }

                if(this.gridPoints[x + 1][y + 1].userData.density > this.threshold) {
                    const current = this.gridPoints[x + 1][y + 1];
                    current.material = red;
                    components.push(...current.position.toArray());

                    const v1 = this.gridPoints[x + 0][y + 1].clone();
                    v1.position.x = MathUtils.lerp(current.position.x, v1.position.x, v1.userData.density);
                    components.push(...v1.position.toArray());

                    const v2 = this.gridPoints[x + 1][y + 0].clone();
                    v2.position.x = MathUtils.lerp(current.position.x, v2.position.x, v2.userData.density);
                    components.push(...v2.position.toArray());
                } else {
                    this.gridPoints[x + 1][y + 1].material = blue;
                }
            }
        }


        if (components.length > 0) {
            const buffer = new Float32Array(components);
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