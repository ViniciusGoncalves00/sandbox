import { ArrowHelper, BufferAttribute, BufferGeometry, Color, ConeGeometry, DoubleSide, Material, Mesh, MeshBasicMaterial, Scene, SphereGeometry, Vector2, Vector3, type Vector2Like } from "three";
import { ControlNode } from "./node";
import { Square } from "./square";
import { lerp, seededRandom } from "three/src/math/MathUtils.js";
import type { Selector } from "../common/selector";

export class Terrain {
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

    public controlNodesAmountX: number = 2;
    public controlNodesAmountZ: number = 2;

    public quadResolutionX: number = 1;
    public quadResolutionZ: number = 1;

    public needRandomizeDirection: boolean = true;
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
        // this.updateMesh();
        this.centralize();

        this.selector.currentContext()?.objects.splice(0);
        this.selector.currentContext()?.objects.push(...this.controlGridSpheres.children);
    }

    public updateMesh(): void {
        this.mesh.clear();

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
        this.controlGrid.splice(0);

        const up = new Vector3(0, 1, 0);

        const sizeX = this.getCellSizeX();
        const sizeZ = this.getCellSizeZ();

        for (let x = 0; x < this.controlNodesAmountX; x++) {
            this.controlGrid[x] = [];
            for (let z = 0; z < this.controlNodesAmountZ; z++) {
                const position = new Vector3(x * sizeX, 0, z * sizeZ);
                const mesh = this.controlNodeDebugSphere.clone();
                mesh.position.set(position.x, position.y, position.z);

                const arrowHelper = new ArrowHelper( up, up, 2, new Color("white") );
                mesh.add(arrowHelper);

                this.controlGridSpheres.add(mesh);

                this.controlGrid[x][z] = new ControlNode(position, up, mesh);
            }
        }
    }

    private generateVertices(): void {
        this.vertices.splice(0);

        const sizeX = this.getQuadSizeX();
        const sizeZ = this.getQuadSizeZ();
        const amountX = this.getVerticesAmountX();
        const amountZ = this.getVerticesAmountZ();

        for (let x = 0; x < amountX; x++) {
            this.vertices[x] = [];
            for (let z = 0; z < amountZ; z++) {
                const vertex = new Vector3();
                vertex.x = x * sizeX;
                vertex.z = z * sizeZ;
            
                this.vertices[x][z] = vertex;
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
        for (let x = 0; x < this.controlGrid.length; x++) {
            for (let z = 0; z < this.controlGrid[0].length; z++) {
                this.updateNeighborhoodVerticesHeight(x, z);
            }
        }
    }

    private updateNeighborhoodVerticesHeight(currentNodeXIndex: number, currentNodeZIndex: number): void {
        const isFirstNodeX = currentNodeXIndex === 0;
        const isFirstNodeZ = currentNodeZIndex === 0;
        const isLastNodeX = currentNodeXIndex === this.controlGrid.length - 1;
        const isLastNodeZ = currentNodeZIndex === this.controlGrid[0].length - 1;

        const minNodeXIndex = isFirstNodeX ? currentNodeXIndex : currentNodeXIndex - 1;
        const minNodeZIndex = isFirstNodeZ ? currentNodeZIndex : currentNodeZIndex - 1;
        const maxNodeXIndex = isLastNodeX ? currentNodeXIndex : currentNodeXIndex + 1;
        const maxNodeZIndex = isLastNodeZ ? currentNodeZIndex : currentNodeZIndex + 1;

        const minXIndex = Math.max(0, minNodeXIndex * this.quadResolutionX);
        const minZIndex = Math.max(0, minNodeZIndex * this.quadResolutionZ);
        const maxXIndex = Math.min(this.getVerticesAmountX() - 1, maxNodeXIndex * this.quadResolutionX);
        const maxZIndex = Math.min(this.getVerticesAmountZ() - 1, maxNodeZIndex * this.quadResolutionZ);

        for (let x = minXIndex; x <= maxXIndex; x++) {
            for (let z = minZIndex; z <= maxZIndex; z++) {
                const vertex = this.vertices[x]?.[z];
                if (!vertex) continue;
                this.calculateHeight(vertex);
            }
        }
    }

    private calculateHeight(vertex: Vector3): void {
        let [x, z] = this.coordinates2ControlNodeIndex(vertex);
        
        const maxNodeX = Math.max(0, this.controlGrid.length - 2);
        const maxNodeZ = Math.max(0, this.controlGrid[0].length - 2);

        if (x > maxNodeX) x = maxNodeX;
        if (z > maxNodeZ) z = maxNodeZ;
        
        const neighbors = this.getNeighbors(x, z);

        const botLeftWeight = this.getWeight(vertex, neighbors.botLeft);
        const botRightWeight = this.getWeight(vertex, neighbors.botRight);
        const topRightWeight = this.getWeight(vertex, neighbors.topRight);
        const topLeftWeight = this.getWeight(vertex, neighbors.topLeft);
            
        const dx = (vertex.x - neighbors.botLeft.position.x) / this.getCellSizeX();
        const dz = (vertex.z - neighbors.botLeft.position.z) / this.getCellSizeZ();

        const u = this.interpolate(dx);
        const v = this.interpolate(dz);

        const nx0 = lerp(botLeftWeight, botRightWeight, u);
        const nx1 = lerp(topLeftWeight, topRightWeight, u);
        const height = lerp(nx0, nx1, v);

        vertex.y = height;
    }

    
    // private getCellResolution(): [number, number] {
    //     const x = this.meshResolutionX / this.controlNodesAmountX;
    //     const z = this.meshResolutionZ / this.controlNodesAmountZ;
    //     return [x, z];
    // }

    private getCellSizeX(): number { return this.gridSizeX / this.controlNodesAmountX; }
    private getCellSizeZ(): number { return this.gridSizeZ / this.controlNodesAmountZ; }

    private getCellsAmountX(): number { return this.controlNodesAmountX - 1; }
    private getCellsAmountZ(): number { return this.controlNodesAmountZ - 1; }
    private getCellsAmount(): number { return this.getCellsAmountX() * this.getCellsAmountZ(); }

    private getQuadSizeX(): number { return this.getCellSizeX() / this.quadResolutionX; }
    private getQuadSizeZ(): number { return this.getCellSizeZ() / this.quadResolutionZ; }

    private getVerticesAmountX(): number { return this.getCellsAmountX() * this.quadResolutionX + 1; }
    private getVerticesAmountZ(): number { return this.getCellsAmountZ() * this.quadResolutionZ + 1; }
    private getVerticesAmount(): number { return this.getVerticesAmountX() * this.getVerticesAmountZ(); }

    private getNeighbors(x: number, z: number): Square<ControlNode<Vector3>> {
        const botLeft = this.controlGrid[x + 0][z + 0];
        const botRight = this.controlGrid[x + 1][z + 0];
        const topRight = this.controlGrid[x + 1][z + 1];
        const topLeft = this.controlGrid[x + 0][z + 1];

        return new Square(botLeft, botRight, topRight, topLeft);
    }

    private coordinates2ControlNodeIndex(coordinates: Vector3): [number, number] {
        const nx = coordinates.x / this.getCellSizeX();
        const nz = coordinates.z / this.getCellSizeZ();

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