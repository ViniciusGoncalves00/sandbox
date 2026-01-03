export abstract class Application {
    protected started: boolean = false;
    
    public awake(): void {}
    public start(): void {
        this.started = true;
    }
    public update(): void {}
    public fixedUpdate(): void {}
    public lateUpdate(): void {}
    public reset(): void {}

    public wasStarted(): boolean {
        return this.started;
    }
};