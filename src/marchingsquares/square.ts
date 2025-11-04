import type { Node, ControlNode } from "./node";

export class Square {
    public botLeft: ControlNode;
    public botRight: ControlNode;
    public topRight: ControlNode;
    public topLeft: ControlNode;

    public botVertex: Node;
    public rightVertex: Node;
    public topVertex: Node;
    public leftVertex: Node;

    public constructor(
        botLeft: ControlNode, botRight: ControlNode, topRight: ControlNode, topLeft: ControlNode,
        botVertex: Node, rightVertex: Node, topVertex: Node, leftVertex: Node
    ) {
        this.botLeft = botLeft;
        this.botRight = botRight;
        this.topRight = topRight;
        this.topLeft = topLeft;

        this.botVertex = botVertex;
        this.rightVertex = rightVertex;
        this.topVertex = topVertex;
        this.leftVertex = leftVertex;
    }

    public getControlNodeByIndex(index: number): ControlNode | null {
        if(index < 0 || index > 3) {
            console.log("Invalid index.");
            return null;
        }

        switch (index) {
            case 0: return this.botLeft;        
            case 1: return this.botRight;        
            case 2: return this.topRight;        
            case 3: return this.topLeft;
            default: return null;
        }
    }
}