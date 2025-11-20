import { ArrowHelper, AxesHelper, Camera, Color, ConeGeometry, CylinderGeometry, DoubleSide, EdgesGeometry, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Quaternion, Raycaster, Vector2, Vector3, type ColorRepresentation, type Scene } from "three";
import type { IHandable } from "../common/interfaces/IHandable";
import { QuadMesh } from "three/webgpu";
import { MeshPostProcessingMaterial, TransformControls } from "three/examples/jsm/Addons.js";
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

    private handlerScaleFactor: number = 4;
    private translateSpeed: number = 0.1;
    private currentSpace: Space = Space.World;
    private currentTransformation: TransformationType = TransformationType.Translate;

     // #region components
    private readonly right: Vector3 = new Vector3(1, 0, 0);
    private readonly upward: Vector3 = new Vector3(0, 1, 0);
    private readonly forward: Vector3 = new Vector3(0, 0, 1);
    // #endregion

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

        this.resize();
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
        const distance = position.distanceTo((this.selectedObject as unknown as Mesh).position) / this.handlerScaleFactor;
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

        const dx = event.clientX - this.startMousePos.x;
        const dy = event.clientY - this.startMousePos.y;

        const movement = new Vector2(dx, dy).normalize();
        const distance = movement.distanceTo(new Vector2()) * this.translateSpeed;

        const cameraDirection = new Vector3();
        const camera = this.scene.getObjectByName("MainCamera") as Camera;
        if (!camera) return;
        camera.getWorldDirection(cameraDirection);

        const mesh = this.selectedObject as unknown as Mesh;
        const width  = this.selector.currentContext()?.element.clientWidth ?? 1;
        const height = this.selector.currentContext()?.element.clientHeight ?? 1;

        if(this.currentSpace === Space.Local) {
            const q = mesh.getWorldQuaternion(new Quaternion());

            switch (this.activeHandle) {
                case "rightTranslate": {
                    const right = new Vector3(1, 0, 0).applyQuaternion(q);
                    mesh.translateX(this.getDelta(camera, mesh.position, right, movement, distance, width, height));
                    break;
                }
                case "upwardTranslate": {
                    const up = new Vector3(0, 1, 0).applyQuaternion(q);
                    mesh.translateY(this.getDelta(camera, mesh.position, up, movement, distance, width, height));
                    break;
                }
                case "forwardTranslate": {
                    const forward = new Vector3(0, 0, 1).applyQuaternion(q);
                    mesh.translateZ(this.getDelta(camera, mesh.position, forward, movement, distance, width, height));
                    break;
                }
                // case "rightRotate": {
                //     const axis = mesh.localToWorld(right).sub(mesh.position).normalize();
                //     const sign = cameraDirection.dot(axis) >= 0 ? 1 : -1;
                //     mesh.rotateX(delta * sign);
                //     break;
                // }
                // case "upwardRotate": {
                //     const axis = mesh.localToWorld(upward).sub(mesh.position).normalize();
                //     const sign = cameraDirection.dot(axis) >= 0 ? 1 : -1;
                //     mesh.rotateY(delta * sign);
                //     break;
                // }
                // case "forwardRotate": {
                //     const axis = mesh.localToWorld(forward).sub(mesh.position).normalize();
                //     const sign = cameraDirection.dot(axis) >= 0 ? 1 : -1;
                //     mesh.rotateZ(delta * sign);
                //     break;
                // }
            }
        } else if (this.currentSpace === Space.World) {
            switch (this.activeHandle) {
                case "rightTranslate": {
                    mesh.position.x += this.getDelta(camera, mesh.position, this.right, movement, distance, width, height);
                    break;
                }
            
                case "upwardTranslate": {
                    mesh.position.y += this.getDelta(camera, mesh.position, this.upward, movement, distance, width, height);
                    break;
                }
            
                case "forwardTranslate": {
                    mesh.position.z += this.getDelta(camera, mesh.position, this.forward, movement, distance, width, height);
                    break;
                }
                case "rightRotate": {
                    const sign = cameraDirection.dot(this.forward) >= 0 ? 1 : -1;
                    const q = new Quaternion().setFromAxisAngle(this.right, distance * sign);
                    mesh.applyQuaternion(q);
                    break;
                }
                case "upwardRotate": {
                    const sign = cameraDirection.dot(this.upward) >= 0 ? 1 : -1;
                    const q = new Quaternion().setFromAxisAngle(this.upward, distance * sign);
                    mesh.applyQuaternion(q);
                    break;
                }
                case "forwardRotate": {
                    const sign = cameraDirection.dot(this.right) >= 0 ? 1 : -1;
                    const q = new Quaternion().setFromAxisAngle(this.forward, distance * sign);
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

    private worldToScreenPoint(point: Vector3, camera: Camera, width: number, height: number): Vector2 {
        const ndc = point.clone().project(camera);
        const screenX = (ndc.x + 1) * 0.5 * width
        const screenY = (1 - ndc.y) * 0.5 * height
        return new Vector2(screenX, screenY);
    }

    private getDelta(
        camera: Camera,
        position: Vector3, axis: Vector3, movement: Vector2,
        distance: number, width: number, height: number
    ): number {
        const direction = position.clone().add(axis.clone());
        const directionPoint = this.worldToScreenPoint(direction, camera, width, height);
        const originPoint = this.worldToScreenPoint(position, camera, width, height);
        const screenDirection = new Vector2().subVectors(directionPoint, originPoint);
        const dot = screenDirection.dot(movement);
        return Math.sign(dot) * distance;
    }

    private endDrag = () => {
        this.selector.enabled = true;
        this.activeHandle = null;
        window.removeEventListener("mousemove", this.onDrag);
        window.removeEventListener("mouseup", this.endDrag);
    }
}