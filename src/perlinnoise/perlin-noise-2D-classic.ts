import { ArrowHelper, BufferAttribute, BufferGeometry, Color, ConeGeometry, DoubleSide, Material, Mesh, MeshBasicMaterial, Scene, SphereGeometry, Vector2, Vector3, type Vector2Like } from "three";
import { ControlNode } from "./node";
import { Square } from "./square";
import { lerp, seededRandom } from "three/src/math/MathUtils.js";
import type { Selector } from "../common/selector";

export class PerlinNoise2D {
    public readonly controlGrid: ControlNode<Vector3>[][] = [];
    public readonly vertices: Vector3[][] = [];

    // #region [Mesh]
    public mesh: Mesh
    public controlGridSpheres: Mesh;

    public sphereGeometry: SphereGeometry;
    public controlNodeDebugSphere: Mesh;
    // #endregion

    // #region [parameters]
    public gridSizeX: number = 100;
    public gridSizeZ: number = 100;

    public controlNodesCellsAmountX: number = 1;
    public controlNodesCellsAmountZ: number = 1;
    public needRandomizeDirection: boolean = true;

    public meshResolutionX = 100;
    public meshResolutionZ = 100;

    public controlNodeCellSizeX: number = 1;
    public controlNodeCellSizeZ: number = 1;
    public resolutionXSize: number = 1;
    public resolutionYSize: number = 1;
    // #endregion

    // #region [visualization]
    public showControlNodes: boolean = true;
    
    // public controlNodeSize: number = 0.1;
    // public directionArrowLength: number = 1;

    private scene: Scene;
    private selector: Selector;
    // #endregion

    public constructor(scene: Scene, selector: Selector) {
        this.scene = scene;
        this.selector = selector;

        this.sphereGeometry = new SphereGeometry(1, 36, 2);
        const material = new MeshBasicMaterial({ color: new Color("green"), transparent: true, opacity: 0.0});
        const wireframe = new MeshBasicMaterial({ color: new Color("white"), wireframe: true});
        this.controlNodeDebugSphere = new Mesh(this.sphereGeometry, material);
        this.controlNodeDebugSphere.add(new Mesh(this.sphereGeometry, wireframe));

        this.mesh = new Mesh();
        this.scene.add(this.mesh);

        this.controlGridSpheres = new Mesh();
        this.scene.add(this.controlGridSpheres);
    }

    public updateControlGrid(): void {
        this.controlGridSpheres.clear();
        this.generateControlGrid();
        this.updateMesh();
        this.centralize();

        this.selector.currentContext()?.objects.splice(0);
        this.selector.currentContext()?.objects.push(...this.controlGridSpheres.children);
    }

    public updateMesh(): void {
        this.mesh.clear();

        this.updateMeshResolution();

        this.generateVertices();
        this.updateVerticesHeight();

        this.generateMesh();
    }

    public randomizeDirections(): void {
        for (let x = 0; x < this.controlGrid.length; x++) {
            for (let z = 0; z < this.controlGrid[0].length; z++) {
                const node = this.controlGrid[x][z];
                this.randomizeDirection(node);
            }
        }
        this.updateMesh();
    }

    public updateNodeDirection(uuid: string): void {
        const node = this.controlGrid.flat().find(node => node.mesh.uuid === uuid);
        if(!node) return;

        const direction: Vector3 = new Vector3();
        node.mesh.getWorldDirection(direction);
        node.direction = direction;
    }

    private randomizeDirection(node: ControlNode<Vector3>): void {
        const direction = new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
        const point = node.mesh.position.clone().add(direction);
        node.direction = direction;
        node.mesh.lookAt(point);
    }

    private generateControlGrid(): void {
        this.updateCellResolution();

        this.controlGrid.splice(0);

        const up = new Vector3(0, 1, 0);

        for (let x = 0; x <= this.controlNodesCellsAmountX; x++) {
            this.controlGrid[x] = [];
            for (let z = 0; z <= this.controlNodesCellsAmountZ; z++) {
                const position = new Vector3(x * this.controlNodeCellSizeX, 0, z * this.controlNodeCellSizeZ);
                const mesh = this.controlNodeDebugSphere.clone();
                mesh.position.set(position.x, position.y, position.z);

                const arrowHelper = new ArrowHelper( up, up, 2, new Color("white") );
                mesh.add(arrowHelper);

                this.controlGridSpheres.add(mesh);

                this.controlGrid[x][z] = new ControlNode(position, up, mesh);
                console.log(mesh.uuid)
            }
        }
    }

    private generateVertices(): void {
        this.vertices.splice(0);
        for (let x = 0; x < this.meshResolutionX; x++) {
            this.vertices[x] = [];
            for (let z = 0; z < this.meshResolutionZ; z++) {
                const vertex = new Vector3();
                vertex.x = x * this.resolutionXSize;
                vertex.z = z * this.resolutionYSize;
            
                this.vertices[x][z] = vertex;
            
                // if (x === this.resolutionX - 1) {
                //     if (!vertices[x + 1]) vertices[x + 1] = [];
                    
                //     const vertex = new Vector3();
                //     vertex.x = (x + 1) * this.resolutionXSize;
                //     vertex.z = (z + 0) * this.resolutionYSize;

                //     const dz = (vertex.z - neighbors.botRight.position.z) / this.controlNodeCellSizeZ;
                //     const v = this.interpolate(dz);
                //     const height = lerp(botRightWeight, topRightWeight, v);

                //     vertex.y = height;

                //     vertices[x + 1][z] = vertex;
                // }
                // if (z === this.resolutionZ - 1) {
                //     const vertex = new Vector3();
                //     vertex.x = (x + 0) * this.resolutionXSize;
                //     vertex.z = (z + 1) * this.resolutionYSize;

                //     const dx = (vertex.x - neighbors.topLeft.position.x) / this.controlNodeCellSizeX;
                //     const u = this.interpolate(dx);
                //     const height = lerp(topLeftWeight, topRightWeight, u);

                //     vertex.y = height;

                //     vertices[x][z + 1] = vertex;
                // }
                // if (x === this.resolutionX - 1 && z === this.resolutionZ - 1) {
                //     if (!vertices[x + 1]) vertices[x + 1] = [];

                //     const vertex = new Vector3();
                //     vertex.x = (x + 1) * this.resolutionXSize;
                //     vertex.z = (z + 1) * this.resolutionYSize;
                    
                //     const dx = (vertex.x - neighbors.topLeft.position.x) / this.controlNodeCellSizeX;
                //     const dz = (vertex.z - neighbors.botRight.position.z) / this.controlNodeCellSizeZ;

                //     const u = this.interpolate(dx);
                //     const v = this.interpolate(dz);

                //     const nx0 = lerp(botLeftWeight, botRightWeight, u);
                //     const nx1 = lerp(topLeftWeight, topRightWeight, u);
                //     const height = lerp(nx0, nx1, v);

                //     vertex.y = height;

                //     vertices[x + 1][z + 1] = vertex;
                // }
            }
        }
    }

    private generateMesh(): void {
        const array: number[] = [];

        for (let x = 0; x < this.vertices.length - 1; x++) {
            for (let y = 0; y < this.vertices[0].length - 1; y++) {
                array.push(...this.vertices[x + 0][y + 0].toArray());
                array.push(...this.vertices[x + 1][y + 0].toArray());
                array.push(...this.vertices[x + 0][y + 1].toArray());

                array.push(...this.vertices[x + 0][y + 1].toArray());
                array.push(...this.vertices[x + 1][y + 0].toArray());
                array.push(...this.vertices[x + 1][y + 1].toArray());
            }
        }

        const attribute = new BufferAttribute(new Float32Array(array), 3);
        const buffer = new BufferGeometry().setAttribute("position", attribute);
        buffer.computeVertexNormals();
        const material = new MeshBasicMaterial({ color: new Color("green"), side: DoubleSide, wireframe: true});
        const mesh = new Mesh(buffer, material);
        this.mesh.add(mesh);
    } 

    private updateVerticesHeight(): void {
        const startOffset: number = 1;
        const endOffset: number = 1;

        if(this.controlGrid.length === 2 && this.controlGrid[0].length === 2) {
            this.updateRangeVerticesHeight(0, 0);
            return;
        } else if(this.controlGrid.length === 2) {
            for (let z = startOffset; z < this.controlGrid[0].length - endOffset; z++) {
                this.updateRangeVerticesHeight(0, z);
            }
            return;
        } else if (this.controlGrid[0].length === 2) {
            for (let x = startOffset; x < this.controlGrid.length - endOffset; x++) {
                this.updateRangeVerticesHeight(x, 0);
            }
            return;
        }

        for (let x = startOffset; x < this.controlGrid.length - endOffset; x++) {
            for (let z = startOffset; z < this.controlGrid[0].length - endOffset; z++) {
                this.updateRangeVerticesHeight(x, z);
            }
        }
    }

    private updateRangeVerticesHeight(controlNodeXIndex: number, controlNodeZIndex: number): void {
        const [verticesPerSquareInX, verticesPerSquareInZ] = this.getCellResolution();

        const previousControlNodeXIndex = controlNodeXIndex === 0 ? controlNodeXIndex : controlNodeXIndex - 1;
        const previousControlNodeZIndex = controlNodeZIndex === 0 ? controlNodeZIndex : controlNodeZIndex - 1;
        const nextControlNodeXIndex = controlNodeXIndex === this.controlGrid.length ? controlNodeXIndex : controlNodeXIndex + 1;
        const nextControlNodeZIndex = controlNodeZIndex === this.controlGrid[0].length ? controlNodeZIndex : controlNodeZIndex + 1;

        const minXIndex = previousControlNodeXIndex * verticesPerSquareInX;
        const minZIndex = previousControlNodeZIndex * verticesPerSquareInZ;
        const maxXIndex = nextControlNodeXIndex * verticesPerSquareInX;
        const maxZIndex = nextControlNodeZIndex * verticesPerSquareInZ;

        for (let x = minXIndex; x < maxXIndex; x++) {
            for (let z = minZIndex; z < maxZIndex; z++) {
                const vertex = this.vertices[x][z];
                this.calculateHeight(vertex);
            }
        }
    }

    private getCellResolution(): [number, number] {
        const x = this.meshResolutionX / this.controlNodesCellsAmountX;
        const z = this.meshResolutionZ / this.controlNodesCellsAmountZ;
        return [x, z];
    }

    private calculateHeight(vertex: Vector3): void {
        const neighbors = this.getNeighbors(vertex);

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
    }

    private updateMeshResolution(): void {
        this.resolutionXSize = this.gridSizeX / this.meshResolutionX;
        this.resolutionYSize = this.gridSizeZ / this.meshResolutionZ;
    }

    private updateCellResolution(): void {
        this.controlNodeCellSizeX = this.gridSizeX / this.controlNodesCellsAmountX;
        this.controlNodeCellSizeZ = this.gridSizeZ / this.controlNodesCellsAmountZ;
    }

    // private generateMesh(): void {
    //     this.updateResolutionSize();

    //     const vertices: Vector3[][] = [];

    //     for (let x = 0; x < this.resolutionX; x++) {
    //         vertices[x] = [];
    //         for (let z = 0; z < this.resolutionZ; z++) {
    //             const vertex = new Vector3();
    //             vertex.x = x * this.resolutionXSize;
    //             vertex.z = z * this.resolutionYSize;
            
    //             this.calculateHeight(vertex);

    //             vertices[x][z] = vertex;
            
    //             // if (x === this.resolutionX - 1) {
    //             //     if (!vertices[x + 1]) vertices[x + 1] = [];
                    
    //             //     const vertex = new Vector3();
    //             //     vertex.x = (x + 1) * this.resolutionXSize;
    //             //     vertex.z = (z + 0) * this.resolutionYSize;

    //             //     const dz = (vertex.z - neighbors.botRight.position.z) / this.controlNodeCellSizeZ;
    //             //     const v = this.interpolate(dz);
    //             //     const height = lerp(botRightWeight, topRightWeight, v);

    //             //     vertex.y = height;

    //             //     vertices[x + 1][z] = vertex;
    //             // }
    //             // if (z === this.resolutionZ - 1) {
    //             //     const vertex = new Vector3();
    //             //     vertex.x = (x + 0) * this.resolutionXSize;
    //             //     vertex.z = (z + 1) * this.resolutionYSize;

    //             //     const dx = (vertex.x - neighbors.topLeft.position.x) / this.controlNodeCellSizeX;
    //             //     const u = this.interpolate(dx);
    //             //     const height = lerp(topLeftWeight, topRightWeight, u);

    //             //     vertex.y = height;

    //             //     vertices[x][z + 1] = vertex;
    //             // }
    //             // if (x === this.resolutionX - 1 && z === this.resolutionZ - 1) {
    //             //     if (!vertices[x + 1]) vertices[x + 1] = [];

    //             //     const vertex = new Vector3();
    //             //     vertex.x = (x + 1) * this.resolutionXSize;
    //             //     vertex.z = (z + 1) * this.resolutionYSize;
                    
    //             //     const dx = (vertex.x - neighbors.topLeft.position.x) / this.controlNodeCellSizeX;
    //             //     const dz = (vertex.z - neighbors.botRight.position.z) / this.controlNodeCellSizeZ;

    //             //     const u = this.interpolate(dx);
    //             //     const v = this.interpolate(dz);

    //             //     const nx0 = lerp(botLeftWeight, botRightWeight, u);
    //             //     const nx1 = lerp(topLeftWeight, topRightWeight, u);
    //             //     const height = lerp(nx0, nx1, v);

    //             //     vertex.y = height;

    //             //     vertices[x + 1][z + 1] = vertex;
    //             // }
    //         }
    //     }

    //     const array: number[] = [];

    //     for (let x = 0; x < vertices.length - 1; x++) {
    //         for (let y = 0; y < vertices[0].length - 1; y++) {
    //             array.push(...vertices[x + 0][y + 0].toArray());
    //             array.push(...vertices[x + 1][y + 0].toArray());
    //             array.push(...vertices[x + 0][y + 1].toArray());

    //             array.push(...vertices[x + 0][y + 1].toArray());
    //             array.push(...vertices[x + 1][y + 0].toArray());
    //             array.push(...vertices[x + 1][y + 1].toArray());
    //         }
    //     }

    //     const attribute = new BufferAttribute(new Float32Array(array), 3);
    //     const buffer = new BufferGeometry().setAttribute("position", attribute);
    //     buffer.computeVertexNormals();
    //     const material = new MeshBasicMaterial({ color: new Color("green"), side: DoubleSide, wireframe: true});
    //     const mesh = new Mesh(buffer, material);
    //     this.mesh.add(mesh);
    // }

    private getNeighbors(coordinates: Vector3): Square<ControlNode<Vector3>> {
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
    }
}