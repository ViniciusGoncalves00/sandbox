export interface Vector2Int {
    x: number;
    z: number;
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

export enum TileType {
    EMPTY,
    SNAKE,
    FOOD,
}

export enum EventType {
    START,
    RESTART,
    PAUSE,
    RESUME,
    QUIT,
    LOSE,
    WIN,
}