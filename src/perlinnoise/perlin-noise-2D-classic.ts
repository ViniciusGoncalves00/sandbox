import { BufferAttribute, BufferGeometry, Color, DoubleSide, Material, Mesh, MeshBasicMaterial, Scene, SphereGeometry, Vector2, Vector3, type Vector2Like } from "three";
import { ControlNode } from "./node";
import { Square } from "./square";
import { lerp, seededRandom } from "three/src/math/MathUtils.js";

export class PerlinNoise2D {
    public controlGrid: ControlNode<Vector3>[][] | null = null;
    public controlGridSpheres: Mesh | null = null;
    public mesh: Mesh | null = null;

    // #region [parameters]
    public gridSizeX: number = 100;
    public gridSizeZ: number = 100;

    public controlNodesCellsAmountX: number = 5;
    public controlNodesCellsAmountZ: number = 5;
    public meshCellsAmountX = 100;
    public meshCellsAmountZ = 100;

    private controlNodeCellSizeX: number = 1;
    private controlNodeCellSizeZ: number = 1;
    private meshCellSizeX: number = 1;
    private meshCellSizeZ: number = 1;
    // #endregion

    // #region [visualization]
    private controlNodeDebugSphere: Mesh;
    private scene: Scene;
    // #endregion

    public constructor(scene: Scene) {
        this.scene = scene;

        const geometry = new SphereGeometry(0.1);
        const material = new MeshBasicMaterial({ color: new Color("red")});
        this.controlNodeDebugSphere = new Mesh(geometry, material);
    }

    public generate(sizeX?: number, sizeY?: number): void {
        this.generateControlGrid(sizeX, sizeY);
        this.generateMesh(sizeX, sizeY);
        this.centralize();
    }

    public generateControlGrid(gridSizeX?: number, gridSizeZ?: number): void {
        const sizeX = gridSizeX ? gridSizeX : this.gridSizeX;
        const sizeZ = gridSizeZ ? gridSizeZ : this.gridSizeZ;

        this.controlNodeCellSizeX = sizeX / this.controlNodesCellsAmountX;
        this.controlNodeCellSizeZ = sizeZ / this.controlNodesCellsAmountZ;

        this.controlGrid = [];
        this.controlGridSpheres = new Mesh();

        for (let x = 0; x <= this.controlNodesCellsAmountX; x++) {
            this.controlGrid[x] = [];
            for (let z = 0; z <= this.controlNodesCellsAmountZ; z++) {
                const position = new Vector3(x * this.controlNodeCellSizeX, 0, z * this.controlNodeCellSizeZ);
                const direction = new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
                const mesh = this.controlNodeDebugSphere.clone();
                mesh.position.set(position.x, position.y, position.z);
                this.controlGridSpheres.add(mesh);

                this.controlGrid[x][z] = new ControlNode(position, direction, this.controlNodeDebugSphere);
            }
        }

        this.scene.add(this.controlGridSpheres);
    }

    public generateMesh(gridSizeX?: number, gridSizeZ?: number): void {
        const sizeX = gridSizeX ? gridSizeX : this.gridSizeX;
        const sizeZ = gridSizeZ ? gridSizeZ : this.gridSizeZ;

        this.meshCellSizeX = sizeX / this.meshCellsAmountX;
        this.meshCellSizeZ = sizeZ / this.meshCellsAmountZ;

        const vertices: Vector3[][] = [];

        for (let x = 0; x < this.meshCellsAmountX; x++) {
            vertices[x] = [];
            for (let z = 0; z < this.meshCellsAmountZ; z++) {
                const vertex = new Vector3();
                vertex.x = x * this.meshCellSizeX;
                vertex.z = z * this.meshCellSizeZ;
            
                const neighbors = this.getNeighbors(vertex);
                if (!neighbors) continue;
            
                const botLeftWeight = this.getWeight(vertex, neighbors.botLeft);
                const botRightWeight = this.getWeight(vertex, neighbors.botRight);
                const topRightWeight = this.getWeight(vertex, neighbors.topRight);
                const topLeftWeight = this.getWeight(vertex, neighbors.topLeft);
            
                const dx = (vertex.x - neighbors.botLeft.position.x) / this.controlNodeCellSizeX;
                const dz = (vertex.z - neighbors.botLeft.position.z) / this.controlNodeCellSizeZ;

                const u = this.interpolate(dx);
                const v = this.interpolate(dz);

                const nx0 = lerp(botLeftWeight, botRightWeight, u);
                const nx1 = lerp(topLeftWeight, topRightWeight, u);
                const height = lerp(nx0, nx1, v);

                vertex.y = height;
                vertices[x][z] = vertex;
            
                if (x === this.meshCellsAmountX - 1) {
                    if (!vertices[x + 1]) vertices[x + 1] = [];
                    
                    const vertex = new Vector3();
                    vertex.x = (x + 1) * this.meshCellSizeX;
                    vertex.z = (z + 0) * this.meshCellSizeZ;

                    const dz = (vertex.z - neighbors.botRight.position.z) / this.controlNodeCellSizeZ;
                    const v = this.interpolate(dz);
                    const height = lerp(botRightWeight, topRightWeight, v);

                    vertex.y = height;

                    vertices[x + 1][z] = vertex;
                }
                if (z === this.meshCellsAmountZ - 1) {
                    const vertex = new Vector3();
                    vertex.x = (x + 0) * this.meshCellSizeX;
                    vertex.z = (z + 1) * this.meshCellSizeZ;

                    const dx = (vertex.x - neighbors.topLeft.position.x) / this.controlNodeCellSizeX;
                    const u = this.interpolate(dx);
                    const height = lerp(topLeftWeight, topRightWeight, u);

                    vertex.y = height;

                    vertices[x][z + 1] = vertex;
                }
                if (x === this.meshCellsAmountX - 1 && z === this.meshCellsAmountZ - 1) {
                    if (!vertices[x + 1]) vertices[x + 1] = [];

                    const vertex = new Vector3();
                    vertex.x = (x + 1) * this.meshCellSizeX;
                    vertex.z = (z + 1) * this.meshCellSizeZ;
                    
                    const dx = (vertex.x - neighbors.topLeft.position.x) / this.controlNodeCellSizeX;
                    const dz = (vertex.z - neighbors.botRight.position.z) / this.controlNodeCellSizeZ;

                    const u = this.interpolate(dx);
                    const v = this.interpolate(dz);

                    const nx0 = lerp(botLeftWeight, botRightWeight, u);
                    const nx1 = lerp(topLeftWeight, topRightWeight, u);
                    const height = lerp(nx0, nx1, v);

                    vertex.y = height;

                    vertices[x + 1][z + 1] = vertex;
                }
            }
        }

        const array: number[] = [];

        for (let x = 0; x < vertices.length - 1; x++) {
            for (let y = 0; y < vertices[0].length - 1; y++) {
                array.push(...vertices[x + 0][y + 0].toArray());
                array.push(...vertices[x + 1][y + 0].toArray());
                array.push(...vertices[x + 0][y + 1].toArray());

                array.push(...vertices[x + 0][y + 1].toArray());
                array.push(...vertices[x + 1][y + 0].toArray());
                array.push(...vertices[x + 1][y + 1].toArray());
            }
        }

        const attribute = new BufferAttribute(new Float32Array(array), 3);
        const buffer = new BufferGeometry().setAttribute("position", attribute);
        buffer.computeVertexNormals();
        const material = new MeshBasicMaterial({ color: new Color("green"), side: DoubleSide, wireframe: true});
        this.mesh = new Mesh(buffer, material);

        this.scene.add(this.mesh);
    }

    public getNeighbors(coordinates: Vector3): Square<ControlNode<Vector3>> | null {
        if (!this.controlGrid) return null;

        const [x, z] = this.coordinates2Index(coordinates);

        const botLeft = this.controlGrid[x + 0][z + 0];
        const botRight = this.controlGrid[x + 1][z + 0];
        const topRight = this.controlGrid[x + 1][z + 1];
        const topLeft = this.controlGrid[x + 0][z + 1];

        return new Square(botLeft, botRight, topRight, topLeft);
    }

    public coordinates2Index(coordinates: Vector3): [number, number] {
        const nx = coordinates.x / this.controlNodeCellSizeX;
        const nz = coordinates.z / this.controlNodeCellSizeZ;

        const x = Math.floor(nx);
        const y = Math.floor(nz);

        return [x, y];
    }

    public getWeight(coordinates: Vector3, controlNode: ControlNode<Vector3>): number {
        const delta = new Vector3().subVectors(coordinates, controlNode.position);
        return controlNode.direction.dot(delta);
    }

    public interpolate(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    public centralize(): void {
        if(!this.mesh || !this.controlGridSpheres) return;
        this.mesh.geometry.computeBoundingBox();

        let center = new Vector3();
        this.mesh.geometry.boundingBox?.getCenter(center);
        this.mesh.translateX(-center.x);
        this.mesh.translateY(-center.y);
        this.mesh.translateZ(-center.z);
        
        this.controlGridSpheres.translateX(-center.x);
        this.controlGridSpheres.translateY(-center.y);
        this.controlGridSpheres.translateZ(-center.z);
    }
}