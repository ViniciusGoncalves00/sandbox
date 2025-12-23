export type Event =
| FinishEvent
| MatchEvent
| LoopEvent;

export enum FinishEvent {
    WIN,
    DRAW,
    LOSE,
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