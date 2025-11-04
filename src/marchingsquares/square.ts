import type { Node, ControlNode } from "./node";

export class Square {
    public botLeft: ControlNode;
    public botRight: ControlNode;
    public topRight: ControlNode;
    public topLeft: ControlNode;

    public bot: Node;
    public right: Node;
    public top: Node;
    public left: Node;
    
    public configuration: number = -1;

    public constructor(
        botLeft: ControlNode, botRight: ControlNode, topRight: ControlNode, topLeft: ControlNode,
        bot: Node, right: Node, top: Node, left: Node
    ) {
        this.botLeft = botLeft;
        this.botRight = botRight;
        this.topRight = topRight;
        this.topLeft = topLeft;

        this.bot = bot;
        this.right = right;
        this.top = top;
        this.left = left;
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

    public updateConfiguration(threshold: number): void {
        this.configuration = 0;

        if (this.botLeft.density > threshold) this.configuration += 1;
        if (this.botRight.density > threshold) this.configuration += 2;
        if (this.topRight.density > threshold) this.configuration += 4;
        if (this.topLeft.density > threshold) this.configuration += 8;
    }
}