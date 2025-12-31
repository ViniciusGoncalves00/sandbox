export abstract class Overlay {
    public start?: () => void;
    public restart?: () => void;
    public pause?: () => void;
    public resume?: () => void;
    public quit?: () => void;

    protected container!: HTMLElement;

    public build(parent: HTMLElement): Overlay {
        this.container = document.createElement("div");
        this.container.classList = "w-full h-full";
        parent.appendChild(this.container);
        this.hide();
        
        return this;
    }

    public show(): void {
        this.container.classList.remove("hidden");
    }

    public hide(): void {
        this.container.classList.add("hidden");
    }

    public dispose(): void {
        this.container.remove();
    }
}
