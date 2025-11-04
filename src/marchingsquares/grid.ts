import { Color, Mesh, MeshBasicMaterial, Object3D, Scene, SphereGeometry } from "three";
import { Node, ControlNode } from "./node";
import { Square } from "./square";

export class Grid {
    public grid: Object3D
    public squares: Square[][] | null = null;
    public controlNodes: ControlNode[][] | null = null;
    public verticesNodes: (Node | null)[][] | null = null;

    public controlNodeMesh: Mesh;
    public debugNodeMesh: Mesh;

    public controNodesMaterial: MeshBasicMaterial;
    public debugNodeMaterial: MeshBasicMaterial;

    public constructor(scene: Scene) {
        this.grid = new Object3D();
        scene.add(this.grid);

        this.controNodesMaterial = new MeshBasicMaterial({ color: new Color(0, 1, 0)});
        this.debugNodeMaterial = new MeshBasicMaterial({ color: new Color(0, 0, 1)});

        const geometry = new SphereGeometry(0.05);
        this.controlNodeMesh = new Mesh(geometry, this.controNodesMaterial);
        this.debugNodeMesh = new Mesh(geometry, this.debugNodeMaterial);
    }

    public generate(nodesAmountX: number, nodesAmountY: number): void {
        const squaresAmountX = nodesAmountX - 1;
        const squaresAmountY = nodesAmountY - 1;
        const verticesAmountX = nodesAmountX * 2 - 1;
        const verticesAmountY = nodesAmountY * 2 - 1;

        this.grid.position.set(-((nodesAmountX - 1) / 2), -((nodesAmountY - 1) / 2), 0);

        this.controlNodes = [];
        for (let x = 0; x < nodesAmountX; x++) {
            this.controlNodes[x] = [];

            for (let y = 0; y < nodesAmountY; y++) {
                const mesh = this.controlNodeMesh.clone();
                mesh.position.set(x, y, 0);

                const density = 1;

                this.controlNodes[x][y] = new ControlNode(density, mesh);
                this.grid.add(mesh);
            }
        }

        this.verticesNodes = [];
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
        
        this.squares = [];
        for (let x = 0; x < squaresAmountX; x++) {
            this.squares[x] = [];

            for (let y = 0; y < squaresAmountY; y++) {
                const botLeft = this.controlNodes[x + 0][y + 0];
                const botRight = this.controlNodes[x + 1][y + 0];
                const topRight = this.controlNodes[x + 1][y + 1];
                const topLeft = this.controlNodes[x + 0][y + 1];

                const botVertex = this.verticesNodes[x * 2 + 1][y * 2 + 0] as Node;
                const rightVertex = this.verticesNodes[x * 2 + 2][y * 2 + 1] as Node;
                const topVertex = this.verticesNodes[x * 2 + 1][y * 2 + 2] as Node;
                const leftVertex = this.verticesNodes[x * 2 + 0][y * 2 + 1] as Node;

                this.squares[x][y] = new Square(
                    botLeft, botRight, topRight, topLeft,
                    botVertex, rightVertex, topVertex, leftVertex,
                )
            }
        }
    }
}