export enum ApplicationEvent {
    Start = "applicationevent:start",
    Restart = "applicationevent:restart",
    Pause = "applicationevent:pause",
    Resume = "applicationevent:resume",
    Quit = "applicationevent:quit",
}

export enum TimeEvent {
    Start = "timeevent:start",
    Stop = "timeevent:stop",
    Update = "timeevent:update",
    FixedUpdate = "timeevent:fixedupdate",
    LateUpdate = "timeevent:lateupdate",
}

export enum OnTabChange {
    Continue = "ontabchange:continue",
    PauseAndResume = "ontabchange:pauseandresume",
    Pause = "ontabchange:pause",
}

export enum ContextState {
    Initialized,
    Created,
    Builded,
    Running,
    Paused,
    Disposed
}

export enum Result {
    Win = "result:win",
    Lose = "result:lose"
}