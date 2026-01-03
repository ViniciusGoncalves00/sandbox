export abstract class Overlay {
    public start?: () => void;
    public restart?: () => void;
    public pause?: () => void;
    public resume?: () => void;
    public quit?: () => void;

    protected container!: HTMLElement;

    public constructor(parent: HTMLElement) {
        this.container = document.createElement("div");
        this.container.classList = "fixed inset-0 flex items-center justify-center";
        parent.appendChild(this.container);
        this.hide();
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
