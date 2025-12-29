import { type Vector2Int, TileState } from "./utils";

export class Board {
    public readonly width: number;
    public readonly height: number;
    public readonly size: number;

    private readonly grid: TileState[];
    private readonly snake: number[];
    private foodIndex: number;

    public constructor(width: number, height: number, initialSnake: Vector2Int[]) {
        this.width = width;
        this.height = height;
        this.size = height * width;

        this.grid = new Array(this.size).fill(TileState.Empty);
        this.snake = [];

        for (const position of initialSnake) {
            const index = this.coordinates2Index(position);
            this.snake.push(index);
            this.grid[index] = TileState.Snake;
        }

        this.foodIndex = this.spawnFood();
    }

    public getTile(position: Vector2Int): TileState {
        return this.grid[this.coordinates2Index(position)];
    }

    //#region COMPARASIONS
    public isInside({ x, y }: Vector2Int): boolean {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }
    
    public isSnake(position: Vector2Int): boolean {
        return this.getTile(position) === TileState.Snake;
    }

    public isSnakeHead(position: Vector2Int): boolean {
        return this.isEquals(position, this.getHead());
    }

    public isSnakeTail(position: Vector2Int): boolean {
        return this.isEquals(position, this.getTail());
    }

    public isFood(position: Vector2Int): boolean {
        return this.getTile(position) === TileState.Food;
    }

    public isEmpty(position: Vector2Int): boolean {
        return this.getTile(position) === TileState.Empty;
    }
    
    public isEquals(a: Vector2Int, b: Vector2Int): boolean {
        return a.x === b.x && a.y === b.y;
    }
    //#endregion

    //#region SNAKE
    public getSnake(): Vector2Int[] {
        return this.snake.map(index => this.index2Coordinates(index));
    }

    public getHead(): Vector2Int {
        return this.index2Coordinates(this.snake[0]);
    }

    public getTail(): Vector2Int {
        return this.index2Coordinates(this.snake[this.snake.length - 1]);
    }

    public snakeSize(): number {
        return this.snake.length;
    }
    
    public moveSnake(newHead: Vector2Int, moveTail: boolean = true): void {
        const headIndex = this.coordinates2Index(newHead);

        this.snake.unshift(headIndex);
        this.grid[headIndex] = TileState.Snake;

        if (moveTail) {
            const tailIndex = this.snake.pop()!;
            this.grid[tailIndex] = TileState.Empty;
        }
    }
    //#endregion
    
    //#region FOOD
    public getFood(): Vector2Int {
        return this.index2Coordinates(this.foodIndex);
    }

    public newFood(): void {
        this.foodIndex = this.spawnFood();
    }

    private spawnFood(): number {
        const empties: number[] = [];

        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i] === TileState.Empty) {
                empties.push(i);
            }
        }

        if (empties.length === 0) return -1;

        const emptyIndex = Math.floor(Math.random() * empties.length);
        const index = empties[emptyIndex];
        this.grid[index] = TileState.Food;
        return index;
    }
    //#endregion

    //#region CONVERSIONS
    private coordinates2Index({ x, y }: Vector2Int): number {
        return y * this.width + x;
    }

    private index2Coordinates(index: number): Vector2Int {
        return {
            x: index % this.width,
            y: Math.floor(index / this.width),
        };
    }
    //#endregion
}
