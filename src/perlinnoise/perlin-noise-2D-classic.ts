import { ArrowHelper, BufferAttribute, BufferGeometry, Color, DoubleSide, Material, Mesh, MeshBasicMaterial, Scene, SphereGeometry, Vector2, Vector3, type Vector2Like } from "three";
import { ControlNode } from "./node";
import { Square } from "./square";
import { lerp, seededRandom } from "three/src/math/MathUtils.js";

export class PerlinNoise2D {
    public controlGrid: ControlNode<Vector3>[][] | null = null;

    // #region [Mesh]
    public mesh: Mesh
    public controlGridSpheres: Mesh;
    public directionArrows: Mesh

    public sphereGeometry: SphereGeometry;
    public controlNodeDebugSphere: Mesh;
    // #endregion

    // #region [parameters]
    public gridSizeX: number = 100;
    public gridSizeZ: number = 100;

    public controlNodesCellsAmountX: number = 1;
    public controlNodesCellsAmountZ: number = 1;
    public randomizeDirection: boolean = true;

    public meshCellsAmountX = 100;
    public meshCellsAmountZ = 100;

    public controlNodeCellSizeX: number = 1;
    public controlNodeCellSizeZ: number = 1;
    public meshCellSizeX: number = 1;
    public meshCellSizeZ: number = 1;
    // #endregion

    // #region [visualization]
    public showControlNodes: boolean = true;
    public showDirectionArrow: boolean = true;
    
    // public controlNodeSize: number = 0.1;
    // public directionArrowLength: number = 1;

    private scene: Scene;
    // #endregion

    public constructor(scene: Scene, ) {
        this.scene = scene;

        this.sphereGeometry = new SphereGeometry(1);
        this.sphereGeometry.scale(0.1, 0.1, 0.1);
        const material = new MeshBasicMaterial({ color: new Color("red")});
        this.controlNodeDebugSphere = new Mesh(this.sphereGeometry, material);

        this.mesh = new Mesh();
        this.scene.add(this.mesh);

        this.controlGridSpheres = new Mesh();
        this.scene.add(this.controlGridSpheres);

        this.directionArrows = new Mesh();
        this.scene.add(this.directionArrows);
    }

    public generate(): void {
        if(this.randomizeDirection) {
            this.controlGridSpheres.clear();
            this.directionArrows.clear();
            this.generateControlGrid();
        }

        this.mesh.clear();
        this.generateMesh();
        this.centralize();
    }

    private generateControlGrid(): void {
        this.controlNodeCellSizeX = this.gridSizeX / this.controlNodesCellsAmountX;
        this.controlNodeCellSizeZ = this.gridSizeZ / this.controlNodesCellsAmountZ;

        this.controlGrid = [];

        for (let x = 0; x <= this.controlNodesCellsAmountX; x++) {
            this.controlGrid[x] = [];
            for (let z = 0; z <= this.controlNodesCellsAmountZ; z++) {
                const position = new Vector3(x * this.controlNodeCellSizeX, 0, z * this.controlNodeCellSizeZ);
                const direction = new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
                const mesh = this.controlNodeDebugSphere.clone();
                mesh.position.set(position.x, position.y, position.z);
                this.controlGridSpheres.add(mesh);

                this.controlGrid[x][z] = new ControlNode(position, direction, this.controlNodeDebugSphere);

                const length = 10;
                const hex = 0xffff00;
                const arrowHelper = new ArrowHelper( direction, position, length, hex );
                this.directionArrows.add( arrowHelper );
            }
        }
    }

    private generateMesh(): void {
        this.meshCellSizeX = this.gridSizeX / this.meshCellsAmountX;
        this.meshCellSizeZ = this.gridSizeZ / this.meshCellsAmountZ;

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

                vertex.y = height + Math.random() * 2;
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
        const mesh = new Mesh(buffer, material);
        this.mesh.add(mesh);
    }

    private getNeighbors(coordinates: Vector3): Square<ControlNode<Vector3>> | null {
        if (!this.controlGrid) return null;

        const [x, z] = this.coordinates2Index(coordinates);

        const botLeft = this.controlGrid[x + 0][z + 0];
        const botRight = this.controlGrid[x + 1][z + 0];
        const topRight = this.controlGrid[x + 1][z + 1];
        const topLeft = this.controlGrid[x + 0][z + 1];

        return new Square(botLeft, botRight, topRight, topLeft);
    }

    private coordinates2Index(coordinates: Vector3): [number, number] {
        const nx = coordinates.x / this.controlNodeCellSizeX;
        const nz = coordinates.z / this.controlNodeCellSizeZ;

        const x = Math.floor(nx);
        const y = Math.floor(nz);

        return [x, y];
    }

    private getWeight(coordinates: Vector3, controlNode: ControlNode<Vector3>): number {
        const delta = new Vector3().subVectors(coordinates, controlNode.position);
        return controlNode.direction.dot(delta);
    }

    private interpolate(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private centralize(): void {
        this.mesh.geometry.computeBoundingBox();

        let center = new Vector3();
        this.mesh.geometry.boundingBox?.getCenter(center);
        this.mesh.translateX(-center.x);
        this.mesh.translateY(-center.y);
        this.mesh.translateZ(-center.z);
        
        this.controlGridSpheres.translateX(-center.x);
        this.controlGridSpheres.translateY(-center.y);
        this.controlGridSpheres.translateZ(-center.z);

        this.directionArrows.translateX(-center.x);
        this.directionArrows.translateY(-center.y);
        this.directionArrows.translateZ(-center.z);
    }
}