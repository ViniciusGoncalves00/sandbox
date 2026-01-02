import { Overlay } from "../base/overlay";

export class ExampleOverlay extends Overlay {
    public constructor(parent: HTMLElement) {
        super(parent);
        
        const button = document.createElement("button");
        button.classList = "bg-white rounded-lg px-4 py-1 flex items-center justify-center cursor-pointer";
        button.textContent = "start";
        button.addEventListener("click", () => this.start?.());
        this.container.appendChild(button);

        return this;
    }
}
