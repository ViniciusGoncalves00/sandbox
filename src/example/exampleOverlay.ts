import { Overlay } from "../base/overlay";

export class ExampleOverlay extends Overlay {
    public build(container: HTMLElement): ExampleOverlay {
        super.build(container);

        const button = document.createElement("button");
        button.classList = "w-full h-full text-white";
        button.textContent = "start";
        button.addEventListener("click", this.start!);
        this.container.appendChild(button);

        return this;
    }
}
