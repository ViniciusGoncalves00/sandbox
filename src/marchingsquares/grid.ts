import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Mesh, MeshBasicMaterial, Object3D, Scene, SphereGeometry, Vector3 } from "three";
import { Node, ControlNode } from "./node";
import { Square } from "./square";
import { MathUtils } from "@viniciusgoncalves/ts-utils";

export class Grid {
    public grid: Object3D
    public squares: Square[][] | null = null;
    public controlNodes: ControlNode[][] | null = null;
    public verticesNodes: (Node | null)[][] | null = null;
    public meshVertices: Vector3[] = [];

    public controlNodeMesh: Mesh;
    public debugNodeMesh: Mesh;

    public controNodesMaterial: MeshBasicMaterial;
    public debugNodeMaterial: MeshBasicMaterial;

    private scene: Scene;

    public constructor(scene: Scene) {
        this.scene = scene;

        this.grid = new Object3D();
        scene.add(this.grid);

        this.controNodesMaterial = new MeshBasicMaterial({ color: new Color(0, 1, 0)});
        this.debugNodeMaterial = new MeshBasicMaterial({ color: new Color(0, 0, 1)});

        const geometry = new SphereGeometry(0.05);
        this.controlNodeMesh = new Mesh(geometry, this.controNodesMaterial);
        this.debugNodeMesh = new Mesh(geometry, this.debugNodeMaterial);
    }

    public generateGrid(nodesAmountX: number, nodesAmountY: number): void {
        this.centralizeGrid(nodesAmountX, nodesAmountY);
        this.createNodeControlsMatrix(nodesAmountX, nodesAmountY);
        this.createVerticesMatrix(nodesAmountX, nodesAmountY);
        this.createSquareMatrix(nodesAmountX, nodesAmountY);
    }

    public randomizeDensity(min: number, max: number): void {
        if(!this.controlNodes) return;
        
        for (let x = 0; x < this.controlNodes.length; x++) {
            for (let y = 0; y < this.controlNodes[0].length; y++) {
                this.controlNodes[x][y].density = MathUtils.randomRange(min, max);                
            }
        }
    }

    public updateConfiguration(threshold: number): void {
        if(!this.squares) return;
        
        for (let x = 0; x < this.squares.length; x++) {
            for (let y = 0; y < this.squares[0].length; y++) {
                this.squares[x][y].updateConfiguration(threshold)       
            }
        }
    }

    public drawGrid(): void {
        if(!this.squares) return;

        for (let x = 0; x < this.squares.length; x++) {
            for (let y = 0; y < this.squares[0].length; y++) {
                const nodes = this.extractNodes(this.squares[x][y]);
                if(!nodes) continue;

                this.triangulate(nodes);
            }
        }

        this.addMesh();
    }

    private centralizeGrid(nodesAmountX: number, nodesAmountY: number): void {
        this.grid.position.set(-((nodesAmountX - 1) / 2), -((nodesAmountY - 1) / 2), 0);
    }

    private createNodeControlsMatrix(nodesAmountX: number, nodesAmountY: number): void {
        this.controlNodes = [];
        for (let x = 0; x < nodesAmountX; x++) {
            this.controlNodes[x] = [];

            for (let y = 0; y < nodesAmountY; y++) {
                const mesh = this.controlNodeMesh.clone();
                mesh.position.set(x, y, 0);

                this.controlNodes[x][y] = new ControlNode(1, mesh);
                this.grid.add(mesh);
            }
        }
    }

    private createVerticesMatrix(nodesAmountX: number, nodesAmountY: number): void {
        this.verticesNodes = [];
        const verticesAmountX = nodesAmountX * 2 - 1;
        const verticesAmountY = nodesAmountY * 2 - 1;

        for (let x = 0; x < verticesAmountX; x++) {
            this.verticesNodes[x] = [];

            for (let y = 0; y < verticesAmountY; y++) {
                if (x % 2 === 0 && y % 2 === 0) {
                    this.verticesNodes[x][y] = null;
                } else if (x % 2 === 1 && y % 2 === 1) {
                    this.verticesNodes[x][y] = null;
                } else {
                    const mesh = this.debugNodeMesh.clone();
                    mesh.position.set(x / 2, y / 2, 0);

                    this.verticesNodes[x][y] = new Node(mesh);
                    this.grid.add(mesh);
                }
            }
        }
    }

    private createSquareMatrix(nodesAmountX: number, nodesAmountY: number): void {
        if(!this.controlNodes || !this.verticesNodes) return;
        
        this.squares = [];
        const squaresAmountX = nodesAmountX - 1;
        const squaresAmountY = nodesAmountY - 1;
    
        for (let x = 0; x < squaresAmountX; x++) {
            this.squares[x] = [];

            for (let y = 0; y < squaresAmountY; y++) {
                const botLeft = this.controlNodes[x + 0][y + 0];
                const botRight = this.controlNodes[x + 1][y + 0];
                const topRight = this.controlNodes[x + 1][y + 1];
                const topLeft = this.controlNodes[x + 0][y + 1];

                const bot = this.verticesNodes[x * 2 + 1][y * 2 + 0] as Node;
                const right = this.verticesNodes[x * 2 + 2][y * 2 + 1] as Node;
                const top = this.verticesNodes[x * 2 + 1][y * 2 + 2] as Node;
                const left = this.verticesNodes[x * 2 + 0][y * 2 + 1] as Node;

                this.squares[x][y] = new Square(
                    botLeft, botRight, topRight, topLeft,
                    bot, right, top, left,
                )
            }
        }
    }

    private extractNodes(square: Square): Node[] | null {
        switch (square.configuration) {
            // 0 points
            case 0: return null;
            // 1 points
            case 1: return [square.botLeft, square.bot, square.left];
            case 2: return [square.botRight, square.right, square.bot];
            case 4: return [square.topRight, square.top, square.right];
            case 8: return [square.topLeft, square.left, square.top];
            // 2 points
            case 3: return [square.botLeft, square.botRight, square.right, square.left];
            case 6: return [square.botRight, square.topRight, square.top, square.bot];
            case 9: return [square.topRight, square.topLeft, square.left, square.right];
            case 12: return [square.topLeft, square.botLeft, square.bot, square.top];
            case 5: return [square.botLeft, square.bot, square.right, square.topRight, square.top, square.left];
            case 10: return [square.botRight, square.right, square.top, square.topLeft, square.left, square.bot];
            // 3 points
            case 7: return [square.botLeft, square.botRight, square.topRight, square.top, square.left];
            case 11: return [square.botRight, square.topRight, square.topLeft, square.left, square.bot];
            case 13: return [square.topRight, square.topLeft, square.botLeft, square.bot, square.right];
            case 14: return [square.topLeft, square.botLeft, square.botRight, square.right, square.top];

            // 4 points
            case 15: return [square.botLeft, square.botRight, square.topRight, square.topLeft];
            default: return null;
        }
    }

    private triangulate(vertices: Node[]): void {
        if(vertices.length >= 3) this.addTriangle([vertices[0].mesh.position, vertices[1].mesh.position, vertices[2].mesh.position]);
        if(vertices.length >= 4) this.addTriangle([vertices[0].mesh.position, vertices[2].mesh.position, vertices[3].mesh.position]);
        if(vertices.length >= 5) this.addTriangle([vertices[0].mesh.position, vertices[3].mesh.position, vertices[4].mesh.position]);
        if(vertices.length >= 6) this.addTriangle([vertices[0].mesh.position, vertices[4].mesh.position, vertices[5].mesh.position]);
    }

    private addTriangle(triangle: [Vector3, Vector3, Vector3]): void {
        this.meshVertices.push(triangle[0], triangle[1], triangle[2]);
    }

    private addMesh(): void {
        const vertices: number[] = [];
        this.meshVertices.forEach(vertex => vertices.push(...vertex.toArray()));

        const buffer = new Float32Array(vertices);
        const geom = new BufferGeometry();
        geom.setAttribute('position', new Float32BufferAttribute(buffer, 3));
        geom.computeVertexNormals();
        
        const mat = new MeshBasicMaterial({ color: 'green', side: DoubleSide });
        const mesh = new Mesh(geom, mat);

        this.grid.add(mesh);
    }
}