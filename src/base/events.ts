export type Event =
| MatchEvent
| GameEvent
| LoopEvent;

// export enum FinishEvent {
//     WIN,
//     DRAW,
//     LOSE,
// }

export enum GameEvent {
    WIN,
    DRAW,
    LOSE,
    ATE,
}

export enum MatchEvent {
    START,
    RESTART,
    PAUSE,
    RESUME,
    QUIT,
}

export enum LoopEvent {
    START,
    STOP,
}