import type { SnakeGame } from "./snakeGame";
import type { Tile } from "./tile";
import type { Vector2Int } from "./utils";

export abstract class Player {
    protected currentDirection: Vector2Int = { x: 0, z: 0};

    protected up: Vector2Int = { x: 0, z: 1 };
    protected down: Vector2Int = { x: 0, z: -1 };
    protected left: Vector2Int = { x: -1, z: 0 };
    protected right: Vector2Int = { x: 1, z: 0 };

    protected directions: Vector2Int[] = [this.up, this.right, this.down, this.left];

    public getDirection(): Vector2Int {
        return this.currentDirection;
    }

    public abstract update(snakeGame: SnakeGame): void;
}

export class Human extends Player {
    private handle: (e: KeyboardEvent) => void;

    public constructor() {
        super();

        this.handle = (e) => this.onKeyDown(e);
        window.addEventListener("keydown", this.handle);
    }

    public update(snakeGame: SnakeGame): void {}

    public destroy(): void {
        window.addEventListener("keydown", this.handle);
    }

    private onKeyDown(e: KeyboardEvent) {
        const key = e.key.toLowerCase();

        if(key === "w") { this.currentDirection = this.currentDirection !== this.down ? this.up : this.down; }
        if(key === "a") { this.currentDirection = this.currentDirection !== this.right ? this.left : this.right; }
        if(key === "s") { this.currentDirection = this.currentDirection !== this.up ? this.down : this.up; }
        if(key === "d") { this.currentDirection = this.currentDirection !== this.left ? this.right : this.left; }
    }
}

export class ShortestPath extends Player {
    public update(snakeGame: SnakeGame): void {
        const food = snakeGame.board.getAllFood()[0];
        const head = snakeGame.snake.head();

        let direction: Vector2Int = { x: 0, z: 0 };

        const dx = food.position.x - head.x;
        const dz = food.position.z - head.z;

        if (dx !== 0) {
            direction = { x: Math.sign(dx), z: 0 };
        } else {
            direction = { x: 0, z: Math.sign(dz) };
        }

        this.currentDirection = direction;
    }
}

export class ShortestValidDirectionPath extends Player {
    public update(snakeGame: SnakeGame): void {
        const food = snakeGame.board.getAllFood()[0];
        const head = snakeGame.snake.head();

        let direction: Vector2Int = { x: 0, z: 0 };

        const dx = food.position.x - head.x;
        const dz = food.position.z - head.z;

        if (dx !== 0) {
            direction = { x: Math.sign(dx), z: 0 };
        } else {
            direction = { x: 0, z: Math.sign(dz) };
        }

        const next = {
            x: head.x + direction.x,
            z: head.z + direction.z
        };

        if (snakeGame.board.hasSnake(next)) {
            const alternatives: Vector2Int[] = [
                { x: 0, z: 1 },
                { x: 1, z: 0 },
                { x: 0, z: -1 },
                { x: -1, z: 0 }
            ];

            for (const alt of alternatives) {
                const test = {
                    x: head.x + alt.x,
                    z: head.z + alt.z
                };
                if (snakeGame.board.isInside(test) && !snakeGame.board.hasSnake(test)) {
                    direction = alt;
                    break;
                }
            }
        }

        this.currentDirection = direction;
    }
}

export class ShortestValidDirectionImprovedPath extends Player {
    public update(snakeGame: SnakeGame): void {
        const food = snakeGame.board.getAllFood()[0];
        const head = snakeGame.snake.head();

        let direction: Vector2Int = { x: 0, z: 0 };

        const dx = food.position.x - head.x;
        const dz = food.position.z - head.z;

        if (dx !== 0) {
            direction = { x: Math.sign(dx), z: 0 };
        } else {
            direction = { x: 0, z: Math.sign(dz) };
        }

        const next = {
            x: head.x + direction.x,
            z: head.z + direction.z
        };

        if (snakeGame.board.hasSnake(next) || snakeGame.board.hasSnake({
            x: head.x + direction.x * 4,
            z: head.z + direction.z * 4})) {
            const distances = [0, 0, 0, 0];

            let indexZ = 0;
            let position: Vector2Int;
            do {
                indexZ++;
                position = {x: head.x, z: head.z + indexZ};
                distances[0]++;
            }
            while (snakeGame.board.isInside(position) && !snakeGame.board.hasSnake(position))

            let indexX = 0;
            do {
                indexX++;
                position = {x: head.x + indexX, z: head.z};
                distances[1]++;
            }
            while (snakeGame.board.isInside(position) && !snakeGame.board.hasSnake(position))

            indexZ = 0;
            do {
                indexZ--;
                position = {x: head.x, z: head.z + indexZ};
                distances[2]++;
            }
            while (snakeGame.board.isInside(position) && !snakeGame.board.hasSnake(position))

            indexX = 0;
            do {
                indexX--;
                position = {x: head.x + indexX, z: head.z};
                distances[3]++;
            }
            while (snakeGame.board.isInside(position) && !snakeGame.board.hasSnake(position))

            const maxValue = Math.max(...distances);
            const maxIndex = distances.indexOf(maxValue);
            direction = this.directions[maxIndex];
        }

        this.currentDirection = direction;
    }
}

export class PseudoHamiltonianCycle extends Player {
    public update(snakeGame: SnakeGame): void {
        const { snake, board } = snakeGame;
        const head = snake.head();
        
        const atTop = head.z === board.height - 1;
        const atBottom = head.z === 0;
        const atLeft = head.x === 0;
        const oneBeforeTop = head.z === board.height - 2;
        const notInTop = head.z < board.height - 2;
        
        const up = { x: 0, z: 1 };
        const right = { x: 1, z: 0 };
        const down = { x: 0, z: -1 };
        const left = { x: -1, z: 0 };
        
        const pos = {
            up: { x: head.x, z: head.z + 1 },
            right: { x: head.x + 1, z: head.z },
            down: { x: head.x, z: head.z - 1 },
        };
    
        const canUp = board.isInside(pos.up) && !board.hasSnake(pos.up);
        const canRight = board.isInside(pos.right) && !board.hasSnake(pos.right);
        const canDown = board.isInside(pos.down) && !board.hasSnake(pos.down);
    
        if (atTop && atLeft) { this.currentDirection = down; return; }
        if (atTop && !atLeft) { this.currentDirection = left; return; }
        if (notInTop && canUp) { this.currentDirection = up; return; }
        if (oneBeforeTop && !board.isInside(pos.right)) { this.currentDirection = up; return; }
        if (canRight && board.hasSnake(pos.down)) { this.currentDirection = right; return; }
        if (canDown) { this.currentDirection = down; return; }
        if (atBottom) { this.currentDirection = right;}
    }
}

export class DepthSearchFirst extends Player {
    public update(snakeGame: SnakeGame): void {
        const visited: Set<string> = new Set();
        const stack: Vector2Int[] = [];
        stack.push(snakeGame.snake.head());
        
        let isEmpty: number = stack.length;
        let direction: Vector2Int = {x: 0, z: 1};
        let foodFound: boolean = false;

        // do {
        //     const current = stack[stack.length - 1];
        //     direction = {x: direction.x - current.x, z: direction.z - current.z};
        //     if(foodFound) continue;

        //     for (const direction of this.directions) {
        //         const position: Vector2Int = {x: current.x + direction.x, z: current.z + direction.z};
        //         if(visited.has(key(position))) continue;

        //         visited.add(key(position));

        //         if(snakeGame.board.hasFood(position)) {
        //             foodFound = true;
        //             break;
        //         } else if (!snakeGame.board.isInside(position)) {
        //             continue;
        //         } else if (snakeGame.board.hasSnake(position)) {
        //             continue;
        //         }

        //         stack.push(position);
        //     }
            
        //     if(isEmpty === stack.length) stack.pop();
        //     isEmpty = stack.length;
        // }
        // while (isEmpty);

        this.currentDirection = direction;
    }
    
    // public update(snakeGame: SnakeGame): void {
    //     const stack: Vector2Int[] = [];
    //     const visited: Set<string> = new Set();
    //     const board = snakeGame.board;
    //     const food = board.getAllFood()[0].position;

    //     let bestDirection: Vector2Int | null = null;
    //     let greaterDistance: number = 0;
    //     let greaterDistanceDirection: Vector2Int | null = null;
    //     let foodFound: boolean = false;

    //     let currentPosition: Vector2Int = snakeGame.snake.head();
    //     stack.push(currentPosition);

    //     while (!foodFound || stack.length > 0) {
    //         const current = stack.pop()!;
    //         const currentKey = key(current);

    //         if(stack.length === 1) bestDirection = current;

    //         if (visited.has(currentKey)) continue;
    //         visited.add(currentKey);

    //         for (const direction of this.directions) {
    //             const next = { x: current.x + direction.x, z: current.z + direction.z };

    //             if (!board.isInside(next)) continue;
    //             if (board.hasSnake(next)) continue;
    //             if (board.hasFood(next)) {
    //                 foodFound = true;
    //                 break;
    //             }

    //             const k = key(next);
    //             if (!visited.has(k)) {
    //                 stack.push(next);
    //                 if(stack.length > greaterDistance) {
    //                     greaterDistance = stack.length;
    //                     greaterDistanceDirection = direction;
    //                 }
    //             }
    //         }
    //     }

    //     if (foodFound) {
    //         this.currentDirection = bestDirection!;
    //     } else {
    //         this.currentDirection = greaterDistanceDirection!;
    //     }
    // }
}

function key(p: Vector2Int): string {
    return `${p.x},${p.z}`;
}