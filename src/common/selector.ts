import { Camera, Raycaster, Vector2, type Mesh } from "three";
import type { ISelectable } from "./interfaces/ISelectable";
import type { SelectionContext } from "./selection-context";

export class Selector {
    public enabled: boolean = true;
    public current: ISelectable | null = null;

    private context: SelectionContext;
    private readonly raycaster: Raycaster;

    // #region Parameters
    public filterVisible: boolean = true;
    // #endregion

    // #region Callbacks
    private trySelectCallback: (event: PointerEvent) => ISelectable | null;
    public onSelectCallbacks: (() => void)[] = [];
    // #endregion

    public constructor(context: SelectionContext) {
        this.raycaster = new Raycaster();
        
        this.trySelectCallback = (event: PointerEvent) => this.trySelect(event, this.context.objects);

        this.context = context;
        this.enterContext();
    }
    
    public changeContext(context: SelectionContext): void {
        this.exitContext();
        this.context = context;
        this.enterContext();
    }

    private enterContext(): void {
        this.context.element.addEventListener("click", this.trySelectCallback);
    }

    private exitContext(): void {
        this.context.element.removeEventListener("click", this.trySelectCallback);
    }

    private trySelect(event: PointerEvent, objects: Mesh[]): ISelectable | null {
        if(objects.length === 0) {
            this.current = null;
            return this.current;
        }

        const normalized = this.normalizeCoordinates(event);
        const coordinates = new Vector2(normalized.x, normalized.y);

        this.raycaster.setFromCamera(coordinates, this.context.camera)

        const filtered = this.filterVisible ? objects.filter(obj => obj.visible) : objects;
        const intersections = this.raycaster.intersectObjects(filtered);
        if(intersections.length === 0) {
            this.current = null;
            return this.current;
        }
        
        this.current = (intersections[0].object as unknown) as ISelectable;
        for (const callback of this.onSelectCallbacks) callback();
        return this.current;
    }

    private normalizeCoordinates(event: PointerEvent): {x: number, y: number} {
        const rect = this.context.element.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        return { x, y };
    }

    private onSelect(): void {}
    private deselect(): void {}
}