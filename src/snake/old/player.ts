import type { SnakeGame } from "./snakeGame";
import type { Tile } from "./tile";
import type { Vector2Int } from "./utils";

const ZERO = { x: 0, z: 0 } as const;
const UP = { x: 0, z: 1 } as const;
const RIGHT = { x: 1, z: 0 } as const;
const DOWN = { x: 0, z: -1 } as const;
const LEFT = { x: -1, z: 0 } as const;

const DIRECTIONS = [
    UP,
    RIGHT,
    DOWN,
    LEFT,
];

export abstract class Player {
    protected currentDirection: Vector2Int = { x: 0, y: 0};

    protected readonly UP = { x: 0, z: 1 } as const;
    protected readonly RIGHT = { x: 1, z: 0 } as const;
    protected readonly DOWN = { x: 0, z: -1 } as const;
    protected readonly LEFT = { x: -1, z: 0 } as const;

    protected readonly DIRECTIONS = [
        this.UP,
        this.RIGHT,
        this.DOWN,
        this.LEFT,
    ];

    public getDirection(): Vector2Int {
        return this.currentDirection;
    }

    public abstract update(snakeGame: SnakeGame): void;

    protected move(direction: Vector2Int): void {
        this.currentDirection = direction;
    }

    protected getPositionInformation(game: SnakeGame): PositionInformation {
        const { board, snake } = game;
        const head = snake.head();
        const food = board.getAllFood()[0].position;

        const up = { x: head.x, z: head.y + 1 };
        const right = { x: head.x + 1, z: head.y };
        const down = { x: head.x, z: head.y - 1 };
        const left = { x: head.x - 1, z: head.y };

        return {
            head,
            food,

            foodAbove: food.y > head.y,
            foodAtRight: food.x > head.x,
            foodUnder: food.y < head.y,
            foodAtLeft: food.x < head.x,
            foodAtSameHeight: food.y === head.y,
            foodAtSameWidth: food.x === head.x,

            atTop: head.y === board.height - 1,
            atRight: head.x === board.width - 1,
            atBottom: head.y === 0,
            atLeft: head.x === 0,

            oneBeforeTop: head.y === board.height - 2,
            oneBeforeRight: head.x === board.width - 2,
            oneBeforeLeft: head.x === 1,
            oneBeforeBottom: head.y === 1,

            canUp: board.isInside(up) && !board.hasSnake(up),
            canRight: board.isInside(right) && !board.hasSnake(right),
            canDown: board.isInside(down) && !board.hasSnake(down),
            canLeft: board.isInside(left) && !board.hasSnake(left),
        };
    }
}

export interface PositionInformation {
    head: Vector2Int;
    food: Vector2Int;
    
    foodAbove: boolean;
    foodAtRight: boolean;
    foodUnder: boolean;
    foodAtLeft: boolean;
    foodAtSameHeight: boolean;
    foodAtSameWidth: boolean;

    atTop: boolean;
    atRight: boolean;
    atBottom: boolean;
    atLeft: boolean;

    oneBeforeTop: boolean;
    oneBeforeRight: boolean;
    oneBeforeLeft: boolean;
    oneBeforeBottom: boolean;

    canUp: boolean;
    canRight: boolean;
    canDown: boolean;
    canLeft: boolean;
}

function hamiltonianCycle(info: PositionInformation): Vector2Int {
    if (info.atTop && info.atLeft) return DOWN;
    if (info.atBottom && !info.canUp) return RIGHT;
    if (!info.oneBeforeTop && info.canUp) return UP;
    if (info.oneBeforeTop && !info.canDown && info.canRight) return RIGHT;
    if (!info.atTop && info.canDown) return DOWN;
    if (info.oneBeforeTop && !info.canRight) return UP;
    if (info.atTop && !info.atLeft) return LEFT;
    return ZERO;
}

function shortcutHamiltoninanCycle(info: PositionInformation): Vector2Int {
    if (info.atTop && info.atLeft) return DOWN;
    if (info.atBottom && !info.canUp) return RIGHT;
    if (!info.oneBeforeTop && info.canUp) return UP;
    if (info.oneBeforeTop && info.foodAtLeft) return UP; //shortcut
    if (info.oneBeforeTop && !info.canDown && info.canRight) return RIGHT;
    if (!info.atTop && info.canDown) return DOWN;
    if (info.oneBeforeTop && !info.canRight) return UP;
    if (info.atTop && !info.atLeft) return LEFT;
    return ZERO;
}

function getAndBack(info: PositionInformation): Vector2Int {
    if (!info.atTop && info.foodAtSameHeight && info.foodAtRight && info.canRight) return RIGHT;
    if (!info.atBottom && !info.atTop && !info.atRight && info.canDown) return DOWN;
    if (info.atLeft && info.atTop && !info.atRight) return DOWN;
    if (info.atBottom && !info.canUp) return RIGHT;
    if (info.oneBeforeTop && !info.oneBeforeRight && info.canRight && info.foodAtRight) return RIGHT;
    if (info.canUp) return UP;
    if (info.atTop) return LEFT;
    return ZERO;
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
        window.removeEventListener("keydown", this.handle);
    }

    private onKeyDown(e: KeyboardEvent) {
        const key = e.key.toLowerCase();

        if(key === "w") { this.currentDirection = this.currentDirection !== this.DOWN ? this.UP : this.DOWN; }
        if(key === "a") { this.currentDirection = this.currentDirection !== this.RIGHT ? this.LEFT : this.RIGHT; }
        if(key === "s") { this.currentDirection = this.currentDirection !== this.UP ? this.DOWN : this.UP; }
        if(key === "d") { this.currentDirection = this.currentDirection !== this.LEFT ? this.RIGHT : this.LEFT; }
    }
}

export class ShortestPath extends Player {
    public update(snakeGame: SnakeGame): void {
        const food = snakeGame.board.getAllFood()[0];
        const head = snakeGame.snake.head();

        let direction: Vector2Int = { x: 0, y: 0 };

        const dx = food.position.x - head.x;
        const dz = food.position.y - head.y;

        if (dx !== 0) {
            direction = { x: Math.sign(dx), y: 0 };
        } else {
            direction = { x: 0, y: Math.sign(dz) };
        }

        this.currentDirection = direction;
    }
}

export class ShortestValidDirectionPath extends Player {
    public update(snakeGame: SnakeGame): void {
        const food = snakeGame.board.getAllFood()[0];
        const head = snakeGame.snake.head();

        let direction: Vector2Int = { x: 0, y: 0 };

        const dx = food.position.x - head.x;
        const dz = food.position.y - head.y;

        if (dx !== 0) {
            direction = { x: Math.sign(dx), y: 0 };
        } else {
            direction = { x: 0, y: Math.sign(dz) };
        }

        const next = {
            x: head.x + direction.x,
            z: head.y + direction.y
        };

        if (snakeGame.board.hasSnake(next)) {
            const alternatives: Vector2Int[] = [
                { x: 0, y: 1 },
                { x: 1, y: 0 },
                { x: 0, y: -1 },
                { x: -1, y: 0 }
            ];

            for (const alt of alternatives) {
                const test = {
                    x: head.x + alt.x,
                    z: head.y + alt.y
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

        let direction: Vector2Int = { x: 0, y: 0 };

        const dx = food.position.x - head.x;
        const dz = food.position.y - head.y;

        if (dx !== 0) {
            direction = { x: Math.sign(dx), y: 0 };
        } else {
            direction = { x: 0, y: Math.sign(dz) };
        }

        const next = {
            x: head.x + direction.x,
            z: head.y + direction.y
        };

        if (snakeGame.board.hasSnake(next) || snakeGame.board.hasSnake({
            x: head.x + direction.x * 2,
            y: head.y + direction.y * 2})) {
            const distances = [0, 0, 0, 0];

            let indexZ = 0;
            let position: Vector2Int;
            do {
                indexZ++;
                position = {x: head.x, y: head.y + indexZ};
                distances[0]++;
            }
            while (snakeGame.board.isInside(position) && !snakeGame.board.hasSnake(position))

            let indexX = 0;
            do {
                indexX++;
                position = {x: head.x + indexX, y: head.y};
                distances[1]++;
            }
            while (snakeGame.board.isInside(position) && !snakeGame.board.hasSnake(position))

            indexZ = 0;
            do {
                indexZ--;
                position = {x: head.x, y: head.y + indexZ};
                distances[2]++;
            }
            while (snakeGame.board.isInside(position) && !snakeGame.board.hasSnake(position))

            indexX = 0;
            do {
                indexX--;
                position = {x: head.x + indexX, y: head.y};
                distances[3]++;
            }
            while (snakeGame.board.isInside(position) && !snakeGame.board.hasSnake(position))

            const maxValue = Math.max(...distances);
            const maxIndex = distances.indexOf(maxValue);
            direction = this.DIRECTIONS[maxIndex];
        }

        this.currentDirection = direction;
    }
}

// 217.000
// 200.000
// 200.000
export class HamiltonianCycle extends Player {
    public update(snakeGame: SnakeGame): void {
        const info = this.getPositionInformation(snakeGame);
        const direction = hamiltonianCycle(info);
        this.move(direction);
    }
}

// 187.000
// 182.000
// 182.000
export class ShortcutHamiltoninanCycle extends Player {
    public update(snakeGame: SnakeGame): void {
        const info = this.getPositionInformation(snakeGame);
        const direction = shortcutHamiltoninanCycle(info);
        this.move(direction);
    }
}

// inconsistent better than simple Hamiltoninan. Sometimes 20% better, sometimes 0%, usually 10%. Somestimes, stucks.
// 184.000
// 176.000
// 184.000
export class GetAndBackHamiltonianCycle extends Player {
    public update(snakeGame: SnakeGame): void {
        const info = this.getPositionInformation(snakeGame);

        const waveHeight = snakeGame.board.height;
        const wavesNeed = Math.floor(snakeGame.snake.size() / waveHeight);
        const insideWave = snakeGame.snake.head().x < wavesNeed;

        const direction = insideWave ? hamiltonianCycle(info) : getAndBack(info);

        this.move(direction);
    }
}

// 124.000
// 122.000
// dead
export class HybridGetAndBackShortcutHamiltonianCycle extends Player {
    public update(snakeGame: SnakeGame): void {
        const info = this.getPositionInformation(snakeGame);

        const waveHeight = snakeGame.board.height;
        const wavesNeed = Math.floor(snakeGame.snake.size() / waveHeight);
        const insideWave = snakeGame.snake.head().x < wavesNeed;

        const direction = insideWave || wavesNeed > snakeGame.board.width / 2 ? shortcutHamiltoninanCycle(info) : getAndBack(info);

        this.move(direction);
    }
}

// 172.000
// 176.000
// 172.000
export class HybridShortcutHamiltonianCycle extends Player {
    public update(snakeGame: SnakeGame): void {
        const info = this.getPositionInformation(snakeGame);

        const waveHeight = snakeGame.board.height;
        const wavesNeed = Math.floor(snakeGame.snake.size() / waveHeight);
        const insideWave = snakeGame.snake.head().x < wavesNeed;

        const direction = insideWave || wavesNeed > snakeGame.board.width / 2 ? hamiltonianCycle(info) : shortcutHamiltoninanCycle(info);

        this.move(direction);
    }
}

// dead
// dead
// 118.000
export class HybridGetAndBackHamiltonianCycle extends Player {
    public update(snakeGame: SnakeGame): void {
        const info = this.getPositionInformation(snakeGame);

        const waveHeight = snakeGame.board.height;
        const wavesNeed = Math.floor(snakeGame.snake.size() / waveHeight);
        const insideWave = snakeGame.snake.head().x < wavesNeed;

        const direction = insideWave || wavesNeed > snakeGame.board.width / 2 ? hamiltonianCycle(info) : getAndBack(info);

        this.move(direction);
    }
}

export class DepthSearchFirst extends Player {
    public update(snakeGame: SnakeGame): void {
        const visited: Set<string> = new Set();
        const stack: Vector2Int[] = [];
        stack.push(snakeGame.snake.head());
        
        let isEmpty: number = stack.length;
        let direction: Vector2Int = {x: 0, y: 1};
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
    return `${p.x},${p.y}`;
}