import { ArrowHelper, AxesHelper, Camera, Color, ConeGeometry, CylinderGeometry, DoubleSide, EdgesGeometry, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Raycaster, Vector2, Vector3, type ColorRepresentation, type Scene } from "three";
import type { IHandable } from "../common/interfaces/IHandable";
import { QuadMesh } from "three/webgpu";
import { MeshPostProcessingMaterial } from "three/examples/jsm/Addons.js";
import type { Selector } from "../common/selector";
import type { ISelectable } from "../common/interfaces/ISelectable";
import { DEFAULT_HANDLER_PARAMETERS, type HandlerParameters } from "./handler-parameters";

export class Handler {
    public readonly toggleKey = "";
    public readonly handler: Object3D;
    // private rotate: Object3D;
    // private scale: Object3D;

    private activeHandle: string | null = null;
    private selectedObject: ISelectable | null = null;
    private startMousePos = new Vector2();
    private currentDelta = new Vector3();

    // #region translation components
    private worldTranslate: Object3D;
    private localTranslate: Object3D;

    private readonly worldRightTranslate: Object3D;
    private readonly worldUpwardTranslate: Object3D;
    private readonly worldForwardTranslate: Object3D;
    private readonly localRightTranslate: Object3D;
    private readonly localUpwardTranslate: Object3D;
    private readonly localForwardTranslate: Object3D;
    // #endregion

    private scene: Scene;
    private selector: Selector;
    private readonly raycaster: Raycaster;

    private scaleFactor: number = 1;
    private currentSpace: string = "world";

    public constructor(scene: Scene, selector: Selector, parameters?: HandlerParameters) {
        this.scene = scene;
        this.selector = selector;

        this.handler = new Object3D();
        this.worldTranslate = new Object3D();
        this.localTranslate = new Object3D();

        const p = { ...DEFAULT_HANDLER_PARAMETERS, ...parameters };
        
        for (const child of p.handler.worldRightTranslate.children) child.userData = { handlerSpace: "world", handlerType: "rightTranslate" };
        for (const child of p.handler.worldUpwardTranslate.children) child.userData = { handlerSpace: "world", handlerType: "upwardTranslate" };
        for (const child of p.handler.worldForwardTranslate.children) child.userData = { handlerSpace: "world", handlerType: "forwardTranslate" };
        for (const child of p.handler.localRightTranslate.children) child.userData = { handlerSpace: "local", handlerType: "rightTranslate" };
        for (const child of p.handler.localUpwardTranslate.children) child.userData = { handlerSpace: "local", handlerType: "upwardTranslate" };
        for (const child of p.handler.localForwardTranslate.children) child.userData = { handlerSpace: "local", handlerType: "forwardTranslate" };

        p.handler.worldRightTranslate.userData = { handlerSpace: "world", handlerType: "rightTranslate" };
        p.handler.worldUpwardTranslate.userData = { handlerSpace: "world", handlerType: "upwardTranslate" };
        p.handler.worldForwardTranslate.userData = { handlerSpace: "world", handlerType: "forwardTranslate" };
        p.handler.localRightTranslate.userData = { handlerSpace: "local", handlerType: "rightTranslate" };
        p.handler.localUpwardTranslate.userData = { handlerSpace: "local", handlerType: "upwardTranslate" };
        p.handler.localForwardTranslate.userData = { handlerSpace: "local", handlerType: "forwardTranslate" };

        this.worldRightTranslate = p.handler.worldRightTranslate;
        this.worldUpwardTranslate = p.handler.worldUpwardTranslate;
        this.worldForwardTranslate = p.handler.worldForwardTranslate;
        this.localRightTranslate = p.handler.localRightTranslate;
        this.localUpwardTranslate = p.handler.localUpwardTranslate;
        this.localForwardTranslate = p.handler.localForwardTranslate;
        this.worldTranslate.add(p.handler.worldForwardTranslate, p.handler.worldRightTranslate, p.handler.worldUpwardTranslate);
        this.localTranslate.add(p.handler.localForwardTranslate, p.handler.localRightTranslate, p.handler.localUpwardTranslate);
        this.handler.add(this.worldTranslate, this.localTranslate);

        this.handler.visible = false;

        scene.add(this.handler);
        this.setSpace("world");

        this.raycaster = new Raycaster();

        window.addEventListener("pointerdown", (event) => this.trySelect(event), {capture: true});
        window.addEventListener("wheel", (event) => this.resize());
        window.addEventListener("mousemove", (event) => this.resize());
        window.addEventListener("keydown", (event) => event.shiftKey ? this.toggleSpace() : undefined);
        this.resize();
    }

    public handle(handable: ISelectable | null): void {
        this.selectedObject = handable;
        this.updateHandler();
    }

    public toggleSpace(): void {
        if(this.currentSpace === "local") {
            this.setSpace("world");
        } else if (this.currentSpace === "world") {
            this.setSpace("local");
        } else {
            console.warn("The currently stored space was not valid for toggling spaces. Using 'world' as a fallback.");
            this.setSpace("world");
        }
    }

    private updateHandler(): void {
        if(!this.selectedObject) {
            this.handler.visible = false;
            return;
        }

        if(this.currentSpace === "world") {
            this.handler.quaternion.identity();
        } else if(this.currentSpace === "local") {
            this.handler.quaternion.copy((this.selectedObject as unknown as Mesh).quaternion);
        } else {
            console.warn("The space could not be repositioned correctly because the value was not recognized as valid. The value must be 'world' or 'local'");
        }
        this.handler.position.copy((this.selectedObject as unknown as Mesh).position);
        this.handler.visible = true;
    }

    private setSpace(space: string): void {
        if(space === "local") {
            this.localTranslate.visible = true;
            this.worldTranslate.visible = false;
            this.currentSpace = "local";
        } else if (space === "world") {
            this.localTranslate.visible = false;
            this.worldTranslate.visible = true;
            this.currentSpace = "world";
        } else {
            console.warn("The space could not be defined because the value was not recognized as valid. The value must be 'world' or 'local'");
        }

        if(this.selectedObject) {
            this.updateHandler();
        }
    }

    private resize(): void {
        if(!this.selectedObject) return;
        
        const camera = this.scene.getObjectByName("MainCamera");
        const position = camera?.position.clone() || new Vector3(1, 1, 1);
        position.set(Math.abs(position.x), Math.abs(position.y), Math.abs(position.z));
        const distance = position.distanceTo((this.selectedObject as unknown as Mesh).position) / 4;
        this.handler.scale.set(distance, distance, distance);
    }

    private trySelect(event: PointerEvent): boolean {
        if (!this.selectedObject) return false;

        const objects: Object3D[] = [];
        this.handler.traverse((child) => {
            if (child instanceof Mesh) objects.push(child);
        });

        const normalized = this.normalizeCoordinates(event);
        const coordinates = new Vector2(normalized.x, normalized.y);

        const camera = this.scene.getObjectByName("MainCamera") as Camera;
        this.raycaster.setFromCamera(coordinates, camera);

        const intersections = this.raycaster.intersectObjects(objects);
        if (intersections.length === 0) return false;

        let object;
        for (const intersection of intersections) {
            if(intersection.object.userData.handlerSpace === this.currentSpace) {
                object = intersection.object;
                break;
            }
        }
        if(!object) {
            console.warn("No object could be found in the current space.");
            return false;
        }
        
        const handleType = object.userData.handlerType;
        if (handleType) {
            this.startDrag(handleType, event);
            return true;
        }

        return false;
    }

    private normalizeCoordinates(event: MouseEvent): {x: number, y: number} {
        const rect = {left: window.screenLeft, top: window.screenTop, width: window.innerWidth, height: window.innerHeight};
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        return { x, y };
    }

    private startDrag(handleType: string, event: MouseEvent) {
        // this.selector.changeContext(null);
        this.selector.enabled = false;
        this.activeHandle = handleType;
        this.startMousePos.set(event.clientX, event.clientY);

        window.addEventListener("mousemove", this.onDrag);
        window.addEventListener("mouseup", this.endDrag);
    }

    private onDrag = (event: MouseEvent) => {
        if (!this.activeHandle || !this.selectedObject) return;

        const deltaX = event.clientX - this.startMousePos.x;
        const deltaY = event.clientY - this.startMousePos.y;
        const factor = 0.02;

        const mesh = this.selectedObject as unknown as Mesh;

        if(this.currentSpace === "local") {
            switch (this.activeHandle) {
                case "rightTranslate": mesh.translateX(deltaX * factor); break;
                case "upwardTranslate": mesh.translateY(-deltaY * factor); break;
                case "forwardTranslate": mesh.translateZ(deltaY * factor); break;
            }
        } else if (this.currentSpace === "world") {
            const pos = mesh.position;

            switch (this.activeHandle) {
                case "rightTranslate": mesh.position.set(pos.x + deltaX * factor, pos.y, pos.z); break;
                case "upwardTranslate": mesh.position.set(pos.x, pos.y - deltaY * factor, pos.z); break;
                case "forwardTranslate": mesh.position.set(pos.x, pos.y, pos.z + deltaY * factor); break;
            }
        } else {
            console.log("The object could not be transformed because the space was not recognized as valid. The value must be 'world' or 'local'");
        }

        this.handler.position.copy(mesh.position);
        this.startMousePos.set(event.clientX, event.clientY);
    }

    private endDrag = () => {
        this.selector.enabled = true;
        this.activeHandle = null;
        window.removeEventListener("mousemove", this.onDrag);
        window.removeEventListener("mouseup", this.endDrag);
    }
}