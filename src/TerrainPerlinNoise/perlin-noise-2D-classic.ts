// import { ArrowHelper, BufferAttribute, BufferGeometry, Color, DoubleSide, Mesh, MeshBasicMaterial, Scene, SphereGeometry, Vector2, Vector3 } from "three";
// import { ControlNode } from "./node";
// import { Square } from "./square";
// import { lerp } from "three/src/math/MathUtils.js";
// import type { Selector } from "../common/selector";

// /**
//  * PerlinNoise2D — implementação baseada no Perlin clássico (gradients grid)
//  * - controlGrid armazena gradientes (ControlNode.direction) em cada grid point
//  * - cada vértice consulta os 4 gradientes ao redor independente da resolução da malha
//  * - fade/interpolate utilizado para suavizar (função de Ken Perlin)
//  */
// export class PerlinNoise2D {
//     public readonly controlGrid: ControlNode<Vector3>[][] = [];
//     public readonly vertices: Vector3[][] = [];

//     // Mesh
//     public mesh: Mesh;
//     public controlGridSpheres: Mesh;

//     public sphereGeometry: SphereGeometry;
//     public controlNodeDebugSphere: Mesh;

//     // parameters
//     public gridSizeX: number = 100;
//     public gridSizeZ: number = 100;

//     // Número de pontos de grade (gradientes). Deve ser >= 2
//     public controlNodesAmountX: number = 2;
//     public controlNodesAmountZ: number = 2;

//     // resolução interna da malha (quads por célula)
//     public quadResolutionX: number = 1;
//     public quadResolutionZ: number = 1;

//     // amplitude do noise
//     public amplitude: number = 1.0;

//     // visualization
//     public showControlNodes: boolean = true;

//     private scene: Scene;
//     private selector: Selector;

//     constructor(scene: Scene, selector: Selector) {
//         this.scene = scene;
//         this.selector = selector;

//         this.sphereGeometry = new SphereGeometry(1, 8, 6);
//         const material = new MeshBasicMaterial({ color: new Color("green"), transparent: true, opacity: 0.0});
//         const wireframe = new MeshBasicMaterial({ color: new Color("white"), wireframe: true});
//         this.controlNodeDebugSphere = new Mesh(this.sphereGeometry, material);
//         this.controlNodeDebugSphere.add(new Mesh(this.sphereGeometry, wireframe));

//         this.mesh = new Mesh();
//         this.scene.add(this.mesh);

//         this.controlGridSpheres = new Mesh();
//         this.scene.add(this.controlGridSpheres);
//     }

//     // --- Public API ---
//     public updateControlGrid(): void {
//         this.controlGridSpheres.clear();
//         this.generateGradientGrid();
//         this.centralize();

//         const ctx = this.selector.currentContext();
//         if (ctx) {
//             ctx.objects.splice(0);
//             ctx.objects.push(...this.controlGridSpheres.children);
//         }
//     }

//     public updateMesh(): void {
//         this.mesh.clear();
//         this.generateVertices();
//         this.updateVerticesHeight();
//         this.generateMesh();
//     }

//     public randomizeGradients(): void {
//         for (let x = 0; x < this.controlGrid.length; x++) {
//             for (let z = 0; z < this.controlGrid[x].length; z++) {
//                 const node = this.controlGrid[x][z];
//                 const g = this.randomUnit2();
//                 node.direction = new Vector3(g.x, 0, g.y);
//                 // orient debug mesh arrow
//                 node.mesh.lookAt(node.mesh.position.clone().add(new Vector3(g.x, 0, g.y)));
//             }
//         }
//         this.updateMesh();
//     }

//     // --- Grid / vertices generation ---
//     private generateGradientGrid(): void {
//         // ensure at least 2 points in each direction
//         this.controlNodesAmountX = Math.max(2, Math.floor(this.controlNodesAmountX));
//         this.controlNodesAmountZ = Math.max(2, Math.floor(this.controlNodesAmountZ));

//         this.controlGrid.splice(0);
//         this.controlGridSpheres.clear();

//         const cellSizeX = this.getCellSizeX();
//         const cellSizeZ = this.getCellSizeZ();

//         for (let x = 0; x < this.controlNodesAmountX; x++) {
//             this.controlGrid[x] = [];
//             for (let z = 0; z < this.controlNodesAmountZ; z++) {
//                 const position = new Vector3(x * cellSizeX, 0, z * cellSizeZ);
//                 const mesh = this.controlNodeDebugSphere.clone();
//                 mesh.position.copy(position);

//                 // arrow helper to visualize
//                 const arrow = new ArrowHelper(new Vector3(0,1,0), new Vector3(0,0,0), 1, 0xffffff);
//                 mesh.add(arrow);

//                 this.controlGridSpheres.add(mesh);

//                 // random gradient (unit 2D vector)
//                 const g = this.randomUnit2();
//                 const grad = new Vector3(g.x, 0, g.y);

//                 this.controlGrid[x][z] = new ControlNode(position.clone(), grad, mesh);
//                 // orient debug mesh
//                 mesh.lookAt(position.clone().add(grad));
//             }
//         }
//     }

//     private generateVertices(): void {
//         this.vertices.splice(0);

//         const sizeX = this.getQuadSizeX();
//         const sizeZ = this.getQuadSizeZ();
//         const amountX = this.getVerticesAmountX();
//         const amountZ = this.getVerticesAmountZ();

//         for (let x = 0; x < amountX; x++) {
//             this.vertices[x] = [];
//             for (let z = 0; z < amountZ; z++) {
//                 const vertex = new Vector3();
//                 vertex.x = x * sizeX;
//                 vertex.z = z * sizeZ;
//                 vertex.y = 0;
//                 this.vertices[x][z] = vertex;
//             }
//         }
//     }

//     // --- Mesh creation (keeps simple non-indexed mesh like before) ---
//     private generateMesh(): void {
//         const array: number[] = [];

//         for (let x = 0; x < this.vertices.length - 1; x++) {
//             for (let y = 0; y < this.vertices[0].length - 1; y++) {
//                 array.push(...this.vertices[x + 0][y + 0].toArray());
//                 array.push(...this.vertices[x + 1][y + 0].toArray());
//                 array.push(...this.vertices[x + 0][y + 1].toArray());

//                 array.push(...this.vertices[x + 0][y + 1].toArray());
//                 array.push(...this.vertices[x + 1][y + 0].toArray());
//                 array.push(...this.vertices[x + 1][y + 1].toArray());
//             }
//         }

//         const attribute = new BufferAttribute(new Float32Array(array), 3);
//         const buffer = new BufferGeometry().setAttribute("position", attribute);
//         buffer.computeVertexNormals();
//         const material = new MeshBasicMaterial({ color: new Color("green"), side: DoubleSide, wireframe: true});
//         const mesh = new Mesh(buffer, material);

//         this.mesh.add(mesh);
//     }

//     // --- Height update using Perlin-classic gradient interpolation ---
//     private updateVerticesHeight(): void {
//         for (let x = 0; x < this.vertices.length; x++) {
//             for (let z = 0; z < this.vertices[x].length; z++) {
//                 const v = this.vertices[x][z];
//                 v.y = this.samplePerlin(v.x, v.z) * this.amplitude;
//             }
//         }
//     }

//     /**
//      * Sample Perlin-like value at world coordinates (x, z)
//      * Uses the controlGrid as a grid of gradients.
//      */
//     private samplePerlin(xWorld: number, zWorld: number): number {
//         // map world pos to grid space
//         const cellSizeX = this.getCellSizeX();
//         const cellSizeZ = this.getCellSizeZ();

//         const gx = xWorld / cellSizeX;
//         const gz = zWorld / cellSizeZ;

//         let ix = Math.floor(gx);
//         let iz = Math.floor(gz);

//         const fx = gx - ix; // fractional
//         const fz = gz - iz;

//         // clamp indices to valid range for gradient lookup
//         const maxIx = Math.max(0, this.controlGrid.length - 2);
//         const maxIz = Math.max(0, this.controlGrid[0].length - 2);

//         if (ix < 0) ix = 0;
//         if (iz < 0) iz = 0;
//         if (ix > maxIx) ix = maxIx;
//         if (iz > maxIz) iz = maxIz;

//         // gradients at corners
//         const g00 = this.controlGrid[ix][iz].direction;       // bottom-left
//         const g10 = this.controlGrid[ix + 1][iz].direction;   // bottom-right
//         const g01 = this.controlGrid[ix][iz + 1].direction;   // top-left
//         const g11 = this.controlGrid[ix + 1][iz + 1].direction; // top-right

//         // offset vectors to corners
//         // bottom-left corner at (0,0) -> offset = (fx, fz)
//         const dx0 = fx;
//         const dz0 = fz;
//         const dx1 = fx - 1; // for right corners
//         const dz1 = fz - 1; // for top corners

//         const n00 = g00.x * dx0 + g00.z * dz0;
//         const n10 = g10.x * dx1 + g10.z * dz0;
//         const n01 = g01.x * dx0 + g01.z * dz1;
//         const n11 = g11.x * dx1 + g11.z * dz1;

//         // fade / interpolation
//         const u = this.interpolate(fx);
//         const v = this.interpolate(fz);

//         const nx0 = lerp(n00, n10, u);
//         const nx1 = lerp(n01, n11, u);
//         const value = lerp(nx0, nx1, v);

//         return value;
//     }

//     // --- Helpers ---
//     private getCellSizeX(): number { return this.gridSizeX / Math.max(1, this.controlNodesAmountX - 1); }
//     private getCellSizeZ(): number { return this.gridSizeZ / Math.max(1, this.controlNodesAmountZ - 1); }

//     private getCellsAmountX(): number { return Math.max(1, this.controlNodesAmountX - 1); }
//     private getCellsAmountZ(): number { return Math.max(1, this.controlNodesAmountZ - 1); }

//     private getQuadSizeX(): number { return this.getCellSizeX() / Math.max(1, this.quadResolutionX); }
//     private getQuadSizeZ(): number { return this.getCellSizeZ() / Math.max(1, this.quadResolutionZ); }

//     private getVerticesAmountX(): number { return this.getCellsAmountX() * Math.max(1, this.quadResolutionX) + 1; }
//     private getVerticesAmountZ(): number { return this.getCellsAmountZ() * Math.max(1, this.quadResolutionZ) + 1; }
//     private getVerticesAmount(): number { return this.getVerticesAmountX() * this.getVerticesAmountZ(); }

//     private getNeighbors(x: number, z: number): Square<ControlNode<Vector3>> {
//         const cx = Math.max(0, Math.min(this.controlGrid.length - 2, x));
//         const cz = Math.max(0, Math.min(this.controlGrid[0].length - 2, z));

//         const botLeft = this.controlGrid[cx + 0][cz + 0];
//         const botRight = this.controlGrid[cx + 1][cz + 0];
//         const topRight = this.controlGrid[cx + 1][cz + 1];
//         const topLeft = this.controlGrid[cx + 0][cz + 1];

//         return new Square(botLeft, botRight, topRight, topLeft);
//     }

//     private coordinates2ControlNodeIndex(coordinates: Vector3): [number, number] {
//         const nx = coordinates.x / this.getCellSizeX();
//         const nz = coordinates.z / this.getCellSizeZ();

//         const x = Math.floor(nx);
//         const y = Math.floor(nz);

//         return [x, y];
//     }

//     private randomUnit2(): Vector2 {
//         const a = Math.random() * Math.PI * 2;
//         return new Vector2(Math.cos(a), Math.sin(a));
//     }

//     private interpolate(t: number): number {
//         // fade function 6t^5 - 15t^4 + 10t^3
//         return t * t * t * (t * (t * 6 - 15) + 10);
//     }

//     private centralize(): void {
//         if (!this.mesh.geometry) return;

//         this.mesh.geometry.computeBoundingBox();

//         let center = new Vector3();
//         this.mesh.geometry.boundingBox?.getCenter(center);

//         this.mesh.translateX(-center.x);
//         this.mesh.translateY(-center.y);
//         this.mesh.translateZ(-center.z);

//         this.controlGridSpheres.translateX(-center.x);
//         this.controlGridSpheres.translateY(-center.y);
//         this.controlGridSpheres.translateZ(-center.z);

//         for (let x = 0; x < this.vertices.length; x++) {
//             for (let z = 0; z < this.vertices[x].length; z++) {
//                 const v = this.vertices[x][z];
//                 v.x -= center.x;
//                 v.y -= center.y;
//                 v.z -= center.z;
//             }
//         }
//     }
// }
