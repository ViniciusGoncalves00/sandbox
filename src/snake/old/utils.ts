export interface Vector2Int {
    x: number;
    y: number;
}

export interface SnakeGameParameters {
    snake: SnakeParameters;
    board: BoardParameters;
}

export interface SnakeParameters {
    speed: number;
}

export interface BoardParameters {
    width: number;
    height: number;
}

export enum TileState {
    Empty,
    Snake,
    Food,
}