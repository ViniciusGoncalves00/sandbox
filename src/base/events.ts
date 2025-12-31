export type Event =
| ApplicationEvent
| MatchEvent
| GameEvent
| OnTabChange
| TimeEvent;

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

export enum ApplicationEvent {
    Start,
    Restart,
    Pause,
    Resume,
    Quit,
}

export enum TimeEvent {
    Start,
    Stop,
    Update,
    FixedUpdate,
    LateUpdate,
}

export enum OnTabChange {
    Continue,
    PauseAndResume,
    Pause
}

export enum ContextState {
    Created,
    Builded,
    Running,
    Paused,
    Disposed
}