import { ArrowHelper, AxesHelper, Camera, Color, ConeGeometry, CylinderGeometry, DoubleSide, EdgesGeometry, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Quaternion, Raycaster, Vector2, Vector3, type ColorRepresentation, type Scene } from "three";
import type { IHandable } from "../common/interfaces/IHandable";
import { QuadMesh } from "three/webgpu";
import { MeshPostProcessingMaterial } from "three/examples/jsm/Addons.js";
import type { Selector } from "../common/selector";
import type { ISelectable } from "../common/interfaces/ISelectable";
import { DEFAULT_HANDLER_PARAMETERS, type HandlerParameters } from "./handler-parameters";
import { Space, TransformationType } from "./enums";

export class Handler {
    public readonly toggleKey = "";
    // private rotate: Object3D;
    // private scale: Object3D;

    private activeHandle: string | null = null;
    private selectedObject: ISelectable | null = null;
    private startMousePos = new Vector2();
    private currentDelta = new Vector3();

    // #region components
    public readonly handler: Object3D;
    private worldTranslate: Object3D;
    private localTranslate: Object3D;
    private worldRotate: Object3D;
    private localRotate: Object3D;
    private worldScale: Object3D;
    private localScale: Object3D;
    // #endregion

    private scene: Scene;
    private selector: Selector;
    private readonly raycaster: Raycaster;

    private scaleFactor: number = 1;
    private currentSpace: Space = Space.World;
    private currentTransformation: TransformationType = TransformationType.Translate;

    public constructor(scene: Scene, selector: Selector, parameters?: HandlerParameters) {
        this.scene = scene;
        this.selector = selector;

        this.handler = new Object3D();
        this.worldTranslate = new Object3D();
        this.localTranslate = new Object3D();
        this.worldRotate = new Object3D();
        this.localRotate = new Object3D();
        this.worldScale = new Object3D();
        this.localScale = new Object3D();
        this.handler.add(this.worldTranslate, this.localTranslate, this.worldRotate, this.localRotate, this.worldScale, this.localScale);
        this.handler.visible = false;

        scene.add(this.handler);

        this.raycaster = new Raycaster();

        window.addEventListener("pointerdown", (event) => this.trySelect(event), {capture: true});
        window.addEventListener("wheel", (event) => this.resize());
        window.addEventListener("mousemove", (event) => this.resize());
        window.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "u":
                    this.toggleSpace();
                    break;
                case "t":
                    this.setTransformation(TransformationType.Translate);
                    break;
                case "r":
                    this.setTransformation(TransformationType.Rotate);
                    break;
                case "y":
                    this.setTransformation(TransformationType.Scale);
                    break;
                default:
                    break;
            }
        });

        const p = { ...DEFAULT_HANDLER_PARAMETERS, ...parameters };
        
        // translate
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

        this.worldTranslate.add(p.handler.worldForwardTranslate, p.handler.worldRightTranslate, p.handler.worldUpwardTranslate);
        this.localTranslate.add(p.handler.localForwardTranslate, p.handler.localRightTranslate, p.handler.localUpwardTranslate);

        // rotate
        for (const child of p.handler.worldRightRotate.children) child.userData = { handlerSpace: "world", handlerType: "rightRotate" };
        for (const child of p.handler.worldUpwardRotate.children) child.userData = { handlerSpace: "world", handlerType: "upwardRotate" };
        for (const child of p.handler.worldForwardRotate.children) child.userData = { handlerSpace: "world", handlerType: "forwardRotate" };
        for (const child of p.handler.localRightRotate.children) child.userData = { handlerSpace: "local", handlerType: "rightRotate" };
        for (const child of p.handler.localUpwardRotate.children) child.userData = { handlerSpace: "local", handlerType: "upwardRotate" };
        for (const child of p.handler.localForwardRotate.children) child.userData = { handlerSpace: "local", handlerType: "forwardRotate" };

        p.handler.worldRightRotate.userData = { handlerSpace: "world", handlerType: "rightRotate" };
        p.handler.worldUpwardRotate.userData = { handlerSpace: "world", handlerType: "upwardRotate" };
        p.handler.worldForwardRotate.userData = { handlerSpace: "world", handlerType: "forwardRotate" };
        p.handler.localRightRotate.userData = { handlerSpace: "local", handlerType: "rightRotate" };
        p.handler.localUpwardRotate.userData = { handlerSpace: "local", handlerType: "upwardRotate" };
        p.handler.localForwardRotate.userData = { handlerSpace: "local", handlerType: "forwardRotate" };

        this.worldRotate.add(p.handler.worldForwardRotate, p.handler.worldRightRotate, p.handler.worldUpwardRotate);
        this.localRotate.add(p.handler.localForwardRotate, p.handler.localRightRotate, p.handler.localUpwardRotate);

        this.setSpace(Space.World);
        this.setTransformation(TransformationType.Translate);

        this.resize();
    }

    public handle(handable: ISelectable | null): void {
        this.selectedObject = handable;
        this.updateHandler();
    }

    public toggleSpace(): void {
        if(this.currentSpace === "local") {
            this.setSpace(Space.World);
        } else if (this.currentSpace === "world") {
            this.setSpace(Space.Local);
        } else {
            console.warn("The currently stored space was not valid for toggling spaces. Using 'world' as a fallback.");
            this.setSpace(Space.World);
        }
    }

    public setTransformation(type: TransformationType): void {
        this.currentTransformation = type;
        this.updateVisibleGizmos();
    }

    public setSpace(space: Space): void {
        if(space === Space.Local) {
            this.worldTranslate.visible = false;
            this.worldRotate.visible = false;
            this.worldScale.visible = false;
            this.localTranslate.visible = this.currentTransformation === TransformationType.Translate ? true : false;
            this.localRotate.visible = this.currentTransformation === TransformationType.Rotate ? true : false;
            this.localScale.visible = this.currentTransformation === TransformationType.Scale ? true : false;
            this.currentSpace = Space.Local;
        } else if (space === Space.World) {
            this.worldTranslate.visible = this.currentTransformation === TransformationType.Translate ? true : false;
            this.worldRotate.visible = this.currentTransformation === TransformationType.Rotate ? true : false;
            this.worldScale.visible = this.currentTransformation === TransformationType.Scale ? true : false;
            this.localTranslate.visible = false;
            this.localRotate.visible = false;
            this.localScale.visible = false;
            this.currentSpace = Space.World;
        } else {
            console.warn("The space could not be defined because the value was not recognized as valid. The value must be 'world' or 'local'");
        }

        if(this.selectedObject) {
            this.updateHandler();
        }
    }

    private updateHandler(): void {
        if(!this.selectedObject) {
            this.handler.visible = false;
            return;
        }

        if(this.currentSpace === Space.World) {
            this.handler.quaternion.identity();
        } else if(this.currentSpace === Space.Local) {
            this.handler.quaternion.copy((this.selectedObject as unknown as Mesh).quaternion);
        } else {
            console.warn("The space could not be repositioned correctly because the value was not recognized as valid. The value must be 'world' or 'local'");
        }
        this.handler.position.copy((this.selectedObject as unknown as Mesh).position);
        this.handler.visible = true;

        this.updateVisibleGizmos();
    }

    private updateVisibleGizmos(): void {
        const isWorld = this.currentSpace === Space.World;

        this.worldTranslate.visible = isWorld && this.currentTransformation === TransformationType.Translate;
        this.localTranslate.visible = !isWorld && this.currentTransformation === TransformationType.Translate;

        this.worldRotate.visible = isWorld && this.currentTransformation === TransformationType.Rotate;
        this.localRotate.visible = !isWorld && this.currentTransformation === TransformationType.Rotate;

        this.worldScale.visible = isWorld && this.currentTransformation === TransformationType.Scale;
        this.localScale.visible = !isWorld && this.currentTransformation === TransformationType.Scale;
    }

    private resize(): void {
        if(!this.selectedObject) return;
        
        const camera = this.scene.getObjectByName("MainCamera");
        const position = camera?.position.clone() || new Vector3(1, 1, 1);
        position.set(Math.abs(position.x), Math.abs(position.y), Math.abs(position.z));
        const distance = position.distanceTo((this.selectedObject as unknown as Mesh).position) / 8;
        this.handler.scale.set(distance, distance, distance);
    }

    private trySelect(event: PointerEvent): boolean {
        if (!this.selectedObject) return false;

        const objects: Object3D[] = [];
        this.handler.traverseVisible((child) => {
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

        const cameraDirection = new Vector3();
        const camera = this.scene.getObjectByName("MainCamera");
        camera?.getWorldDirection(cameraDirection);

        const right = new Vector3(1, 0, 0);
        const upward = new Vector3(0, 1, 0);
        const forward = new Vector3(0, 0, 1);

        if(this.currentSpace === Space.Local) {
            switch (this.activeHandle) {
                case "rightTranslate": {
                    const axis = mesh.localToWorld(right).sub(mesh.position).normalize();
                    const sign = cameraDirection.dot(axis) >= 0 ? 1 : -1;
                    mesh.translateX(deltaX * factor * sign);
                    break;
                }
                case "upwardTranslate": {
                    const axis = mesh.localToWorld(upward).sub(mesh.position).normalize();
                    const sign = cameraDirection.dot(axis) >= 0 ? 1 : -1;
                    mesh.translateY(-deltaY * factor * sign);
                    break;
                }
                case "forwardTranslate": {
                    const axis = mesh.localToWorld(forward).sub(mesh.position).normalize();
                    const sign = cameraDirection.dot(axis) >= 0 ? 1 : -1;
                    mesh.translateZ(deltaY * factor * sign);
                    break;
                }
                case "rightRotate": {
                    const axis = mesh.localToWorld(right).sub(mesh.position).normalize();
                    const sign = cameraDirection.dot(axis) >= 0 ? 1 : -1;
                    mesh.rotateX(deltaX * factor * sign);
                    break;
                }
                case "upwardRotate": {
                    const axis = mesh.localToWorld(upward).sub(mesh.position).normalize();
                    const sign = cameraDirection.dot(axis) >= 0 ? 1 : -1;
                    mesh.rotateY(deltaX * factor * sign);
                    break;
                }
                case "forwardRotate": {
                    const axis = mesh.localToWorld(forward).sub(mesh.position).normalize();
                    const sign = cameraDirection.dot(axis) >= 0 ? 1 : -1;
                    mesh.rotateZ(deltaX * factor * sign);
                    break;
                }
            }
        } else if (this.currentSpace === Space.World) {
            switch (this.activeHandle) {
                case "rightTranslate": {
                    const sign = cameraDirection.dot(forward) >= 0 ? 1 : -1;
                    mesh.position.x -= deltaX * factor * sign;
                    break;
                }
            
                case "upwardTranslate": {
                    mesh.position.y -= deltaY * factor;
                    break;
                }
            
                case "forwardTranslate": {
                    const sign = cameraDirection.dot(right) >= 0 ? 1 : -1;
                    mesh.position.z += deltaX * factor * sign;
                    break;
                }
                case "rightRotate": {
                    const sign = cameraDirection.dot(forward) >= 0 ? 1 : -1;
                    const q = new Quaternion().setFromAxisAngle(right, deltaY * factor * sign);
                    mesh.applyQuaternion(q);
                    break;
                }
                case "upwardRotate": {
                    const sign = cameraDirection.dot(upward) >= 0 ? 1 : -1;
                    const q = new Quaternion().setFromAxisAngle(upward, deltaX * factor * sign);
                    mesh.applyQuaternion(q);
                    break;
                }
                case "forwardRotate": {
                    const sign = cameraDirection.dot(right) >= 0 ? 1 : -1;
                    const q = new Quaternion().setFromAxisAngle(forward, deltaY * factor * sign);
                    mesh.applyQuaternion(q);
                    break;
                }
            }
        } else {
            console.log("The object could not be transformed because the space was not recognized as valid. The value must be 'world' or 'local'");
        }

        this.updateHandler();
        this.startMousePos.set(event.clientX, event.clientY);
    }

    private endDrag = () => {
        this.selector.enabled = true;
        this.activeHandle = null;
        window.removeEventListener("mousemove", this.onDrag);
        window.removeEventListener("mouseup", this.endDrag);
    }
}