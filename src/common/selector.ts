import { Camera, Object3D, Raycaster, Vector2, type Intersection, type Mesh } from "three";
import type { ISelectable } from "./interfaces/ISelectable";
import type { SelectionContext } from "./selection-context";

export class Selector {
    public enabled: boolean = true;
    public current: ISelectable | null = null;

    private context: SelectionContext | null = null;
    private previousContext: SelectionContext | null = null;
    private readonly raycaster: Raycaster;

    // #region Parameters
    public filterVisible: boolean = true;
    // #endregion

    // #region Callbacks
    private trySelectCallback: (event: PointerEvent) => ISelectable | null;
    public onSelectCallbacks: (() => void)[] = [];
    public onDeselectCallbacks: (() => void)[] = [];
    public onEnterContextCallbacks: (() => void)[] = [];
    public onExitContextCallbacks: (() => void)[] = [];
    // #endregion

    public constructor(context: SelectionContext) {
        this.raycaster = new Raycaster();
        
        this.trySelectCallback = (event: PointerEvent) => {
            if(this.context) {
                return this.trySelect(event, this.context.objects)
            }
            return null;
        };

        this.context = context;
        this.enterContext();
    }

    public changeContext(context: SelectionContext | null): void {
        this.exitContext();
        this.previousContext = this.context;
        this.context = context;
        this.enterContext();
    }

    public restorePreviousContext(): void {
        this.changeContext(this.previousContext);
    }

    private enterContext(): void {
        this.context?.element.addEventListener("pointerdown", this.trySelectCallback);
        for (const callback of this.onEnterContextCallbacks) callback();
    }

    private exitContext(): void {
        this.context?.element.removeEventListener("pointerdown", this.trySelectCallback);
        for (const callback of this.onExitContextCallbacks) callback();
    }

    private trySelect(event: PointerEvent, objects: Object3D[]): ISelectable | null {
        if(!this.enabled || !this.context) return null;
        console.log("TRIED SELECT")

        if(objects.length === 0) return this.deselect();

        const coordinates = this.normalizeCoordinates(event);
        this.raycaster.setFromCamera(coordinates, this.context.camera);

        const filtered = this.filterVisible ? objects.filter(obj => obj.visible) : objects;
        const intersections = this.raycaster.intersectObjects(filtered);
        if(intersections.length === 0) return this.deselect();
        
        return this.select(intersections);
    }

    private normalizeCoordinates(event: PointerEvent): Vector2 {
        if(!this.context) return new Vector2();

        const rect = this.context.element.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        return new Vector2(x, y);
    }

    private select(intersections: Intersection<Object3D>[]): ISelectable {
        const object = intersections[0].object;
        this.current = (object as unknown) as ISelectable;
        for (const callback of this.onSelectCallbacks) callback();
        return this.current;
    }
    private deselect(): null {
        this.current = null;
        for (const callback of this.onDeselectCallbacks) callback();
        return null;
    }
}