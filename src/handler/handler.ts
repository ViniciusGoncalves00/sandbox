import { ArrowHelper, AxesHelper, Camera, Color, ConeGeometry, CylinderGeometry, DoubleSide, EdgesGeometry, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Quaternion, Raycaster, Vector2, Vector3, type ColorRepresentation, type Scene } from "three";
import type { IHandable } from "../common/interfaces/IHandable";
import { QuadMesh } from "three/webgpu";
import { MeshPostProcessingMaterial, TransformControls } from "three/examples/jsm/Addons.js";
import type { Selector } from "../common/selector";
import type { ISelectable } from "../common/interfaces/ISelectable";
import { DEFAULT_HANDLER_PARAMETERS, type HandlerParameters } from "./handler-parameters";
import { Axis, Space, Transformation } from "./enums";
import { HandlerComponent } from "./handler-component";


export class Handler {
    public readonly toggleKey = "";
    // private rotate: Object3D;
    // private scale: Object3D;

    private activeHandle: HandlerComponent | null = null;
    private selectedObject: ISelectable | null = null;
    private startMousePos = new Vector2();
    private currentDelta = new Vector3();
    private lastAngle: number = 0;

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
    private currentTransformation: Transformation = Transformation.Translate;

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
                    this.setTransformation(Transformation.Translate);
                    break;
                case "r":
                    this.setTransformation(Transformation.Rotate);
                    break;
                case "y":
                    this.setTransformation(Transformation.Scale);
                    break;
                default:
                    break;
            }
        });

        const p = { ...DEFAULT_HANDLER_PARAMETERS, ...parameters };

        // translate
        const worldRightTranslate = new HandlerComponent(Space.World, Axis.X, Transformation.Translate);
        const worldUpwardTranslate = new HandlerComponent(Space.World, Axis.Y, Transformation.Translate);
        const worldForwardTranslate = new HandlerComponent(Space.World, Axis.Z, Transformation.Translate);
        const localRightTranslate = new HandlerComponent(Space.Local, Axis.X, Transformation.Translate);
        const localUpwardTranslate = new HandlerComponent(Space.Local, Axis.Y, Transformation.Translate);
        const localForwardTranslate = new HandlerComponent(Space.Local, Axis.Z, Transformation.Translate);

        for (const child of p.handler.worldRightTranslate.children) child.userData = { handler: worldRightTranslate };
        for (const child of p.handler.worldUpwardTranslate.children) child.userData = { handler: worldUpwardTranslate };
        for (const child of p.handler.worldForwardTranslate.children) child.userData = { handler: worldForwardTranslate };
        for (const child of p.handler.localRightTranslate.children) child.userData = { handler: localRightTranslate };
        for (const child of p.handler.localUpwardTranslate.children) child.userData = { handler: localUpwardTranslate };
        for (const child of p.handler.localForwardTranslate.children) child.userData = { handler: localForwardTranslate };

        p.handler.worldRightTranslate.userData = { handler: worldRightTranslate };
        p.handler.worldUpwardTranslate.userData = { handler: worldUpwardTranslate };
        p.handler.worldForwardTranslate.userData = { handler: worldForwardTranslate };
        p.handler.localRightTranslate.userData = { handler: localRightTranslate };
        p.handler.localUpwardTranslate.userData = { handler: localUpwardTranslate };
        p.handler.localForwardTranslate.userData = { handler: localForwardTranslate };

        this.worldTranslate.add(p.handler.worldForwardTranslate, p.handler.worldRightTranslate, p.handler.worldUpwardTranslate);
        this.localTranslate.add(p.handler.localForwardTranslate, p.handler.localRightTranslate, p.handler.localUpwardTranslate);

        // rotate
        const worldRightRotate = new HandlerComponent(Space.World, Axis.X, Transformation.Rotate);
        const worldUpwardRotate = new HandlerComponent(Space.World, Axis.Y, Transformation.Rotate);
        const worldForwardRotate = new HandlerComponent(Space.World, Axis.Z, Transformation.Rotate);
        const localRightRotate = new HandlerComponent(Space.Local, Axis.X, Transformation.Rotate);
        const localUpwardRotate = new HandlerComponent(Space.Local, Axis.Y, Transformation.Rotate);
        const localForwardRotate = new HandlerComponent(Space.Local, Axis.Z, Transformation.Rotate);

        for (const child of p.handler.worldRightRotate.children) child.userData = { handler: worldRightRotate };
        for (const child of p.handler.worldUpwardRotate.children) child.userData = { handler: worldUpwardRotate };
        for (const child of p.handler.worldForwardRotate.children) child.userData = { handler: worldForwardRotate };
        for (const child of p.handler.localRightRotate.children) child.userData = { handler: localRightRotate };
        for (const child of p.handler.localUpwardRotate.children) child.userData = { handler: localUpwardRotate };
        for (const child of p.handler.localForwardRotate.children) child.userData = { handler: localForwardRotate };

        p.handler.worldRightRotate.userData = { handler: worldRightRotate };
        p.handler.worldUpwardRotate.userData = { handler: worldUpwardRotate };
        p.handler.worldForwardRotate.userData = { handler: worldForwardRotate };
        p.handler.localRightRotate.userData = { handler: localRightRotate };
        p.handler.localUpwardRotate.userData = { handler: localUpwardRotate };
        p.handler.localForwardRotate.userData = { handler: localForwardRotate };

        this.worldRotate.add(p.handler.worldForwardRotate, p.handler.worldRightRotate, p.handler.worldUpwardRotate);
        this.localRotate.add(p.handler.localForwardRotate, p.handler.localRightRotate, p.handler.localUpwardRotate);

         // scale
        const worldRightScale = new HandlerComponent(Space.World, Axis.X, Transformation.Scale);
        const worldUpwardScale = new HandlerComponent(Space.World, Axis.Y, Transformation.Scale);
        const worldForwardScale = new HandlerComponent(Space.World, Axis.Z, Transformation.Scale);
        const localRightScale = new HandlerComponent(Space.Local, Axis.X, Transformation.Scale);
        const localUpwardScale = new HandlerComponent(Space.Local, Axis.Y, Transformation.Scale);
        const localForwardScale = new HandlerComponent(Space.Local, Axis.Z, Transformation.Scale);

        for (const child of p.handler.worldRightScale.children) child.userData = { handler: worldRightScale };
        for (const child of p.handler.worldUpwardScale.children) child.userData = { handler: worldUpwardScale };
        for (const child of p.handler.worldForwardScale.children) child.userData = { handler: worldForwardScale };
        for (const child of p.handler.localRightScale.children) child.userData = { handler: localRightScale };
        for (const child of p.handler.localUpwardScale.children) child.userData = { handler: localUpwardScale };
        for (const child of p.handler.localForwardScale.children) child.userData = { handler: localForwardScale };

        p.handler.worldRightScale.userData = { handler: worldRightScale };
        p.handler.worldUpwardScale.userData = { handler: worldUpwardScale };
        p.handler.worldForwardScale.userData = { handler: worldForwardScale };
        p.handler.localRightScale.userData = { handler: localRightScale };
        p.handler.localUpwardScale.userData = { handler: localUpwardScale };
        p.handler.localForwardScale.userData = { handler: localForwardScale };

        this.worldScale.add(p.handler.worldForwardScale, p.handler.worldRightScale, p.handler.worldUpwardScale);
        this.localScale.add(p.handler.localForwardScale, p.handler.localRightScale, p.handler.localUpwardScale);

        this.setSpace(Space.World);
        this.setTransformation(Transformation.Translate);

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

    public setTransformation(type: Transformation): void {
        this.currentTransformation = type;
        this.updateVisibleGizmos();
    }

    public setSpace(space: Space): void {
        if(space === Space.Local) {
            this.worldTranslate.visible = false;
            this.worldRotate.visible = false;
            this.worldScale.visible = false;
            this.localTranslate.visible = this.currentTransformation === Transformation.Translate ? true : false;
            this.localRotate.visible = this.currentTransformation === Transformation.Rotate ? true : false;
            this.localScale.visible = this.currentTransformation === Transformation.Scale ? true : false;
            this.currentSpace = Space.Local;
        } else if (space === Space.World) {
            this.worldTranslate.visible = this.currentTransformation === Transformation.Translate ? true : false;
            this.worldRotate.visible = this.currentTransformation === Transformation.Rotate ? true : false;
            this.worldScale.visible = this.currentTransformation === Transformation.Scale ? true : false;
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

        this.worldTranslate.visible = isWorld && this.currentTransformation === Transformation.Translate;
        this.localTranslate.visible = !isWorld && this.currentTransformation === Transformation.Translate;

        this.worldRotate.visible = isWorld && this.currentTransformation === Transformation.Rotate;
        this.localRotate.visible = !isWorld && this.currentTransformation === Transformation.Rotate;

        this.worldScale.visible = isWorld && this.currentTransformation === Transformation.Scale;
        this.localScale.visible = !isWorld && this.currentTransformation === Transformation.Scale;
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
            if(intersection.object.userData.handler && intersection.object.userData.handler.space === this.currentSpace) {
                object = intersection.object;
                break;
            }
        }
        if(!object) {
            console.warn("No object could be found in the current space.");
            return false;
        }
        
        const handlerComponent = object.userData.handler;
        if (handlerComponent) {
            this.startDrag(handlerComponent, event);
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

    private startDrag(handlerComponent: HandlerComponent, event: MouseEvent) {
        this.selector.enabled = false;
        this.activeHandle = handlerComponent;
        this.startMousePos.set(event.clientX, event.clientY);
        
        const mesh = this.selectedObject as unknown as Mesh;
        const camera = this.scene.getObjectByName("MainCamera") as Camera;
        const width  = this.selector.currentContext()?.element.clientWidth ?? 1;
        const height = this.selector.currentContext()?.element.clientHeight ?? 1;
        const center = this.worldToScreenPoint(mesh.position, camera, width, height);
        this.lastAngle = Math.atan2(event.clientY - center.y, event.clientX - center.x);

        window.addEventListener("mousemove", this.onDrag);
        window.addEventListener("mouseup", this.endDrag);
    }

    private onDrag = (event: MouseEvent) => {
        if (!this.activeHandle || !this.selectedObject) return;

        const handler = this.activeHandle;
        const mesh = this.selectedObject as unknown as Mesh;

        const dx = event.clientX - this.startMousePos.x;
        const dy = event.clientY - this.startMousePos.y;

        const moveDirection = new Vector2(dx, dy).normalize();
        const moveDistance = moveDirection.length() * this.translateSpeed;

        const camera = this.scene.getObjectByName("MainCamera") as Camera;
        if (!camera) return;

        const mousePos = new Vector2(event.clientX, event.clientY);
        const width  = this.selector.currentContext()?.element.clientWidth ?? 1;
        const height = this.selector.currentContext()?.element.clientHeight ?? 1;

        const axis = this.getAxisVector(handler.axis);

        if (handler.isTranslate()) {
            const delta = this.getDeltaTranslation(
                camera,
                mesh.position,
                axis,
                moveDirection,
                moveDistance,
                width,
                height
            );
            if(handler.space === Space.Local) {
                mesh.translateOnAxis(axis, -delta);
            } else if(handler.space === Space.World) {
                mesh.position.addScaledVector(axis, -delta);
            }
        } else if (handler.isRotate()) {
            const cameraDir = new Vector3();
            camera.getWorldDirection(cameraDir);

            if (handler.space === Space.Local) {
                axis.applyQuaternion(mesh.getWorldQuaternion(new Quaternion()));
            }

            const currentAngle = this.getAngle(camera, mesh.position, mousePos, width, height);
            const deltaAngle = this.getRotation(currentAngle, cameraDir, axis);

            mesh.rotateOnWorldAxis(axis, deltaAngle);  
            this.lastAngle = currentAngle;
        } else if (handler.isScale()) {
            const delta = this.getDeltaTranslation(
                camera,
                mesh.position,
                axis,
                moveDirection,
                moveDistance,
                width,
                height
            );
        
            const scaleFactor = 1 + (delta * -1);
        
            if (handler.space === Space.Local) {
                mesh.scale[handler.axis] *= scaleFactor;
            } else {
                axis.applyQuaternion(
                    mesh.getWorldQuaternion(new Quaternion())
                );
            
                if (Math.abs(axis.x) > 0.5) mesh.scale.x *= scaleFactor;
                if (Math.abs(axis.y) > 0.5) mesh.scale.y *= scaleFactor;
                if (Math.abs(axis.z) > 0.5) mesh.scale.z *= scaleFactor;
            }
        }

        this.updateHandler();
        this.startMousePos.set(event.clientX, event.clientY);
    }

    private getAxisVector(axis: Axis): Vector3 {
        const BASE_AXES = {
            [Axis.X]: this.right,
            [Axis.Y]: this.upward,
            [Axis.Z]: this.forward,
        };

        return BASE_AXES[axis].clone();
    }

    private worldToScreenPoint(point: Vector3, camera: Camera, width: number, height: number): Vector2 {
        const ndc = point.clone().project(camera);
        const screenX = (ndc.x + 1) * 0.5 * width
        const screenY = (1 - ndc.y) * 0.5 * height
        return new Vector2(screenX, screenY);
    }

    private screenDirection(p1: Vector2, p2: Vector2): Vector2 {
        return new Vector2().subVectors(p2, p1);
    }

    private getDeltaTranslation(
        camera: Camera,
        position: Vector3, axis: Vector3, movement: Vector2,
        distance: number, width: number, height: number
    ): number {
        const direction = position.clone().add(axis.clone());
        const directionPoint = this.worldToScreenPoint(direction, camera, width, height);
        const originPoint = this.worldToScreenPoint(position, camera, width, height);
        const screenDirection = this.screenDirection(directionPoint, originPoint);
        const dot = screenDirection.dot(movement);
        return Math.sign(dot) * distance;
    }

    private getAngle(
        camera: Camera, position: Vector3, mousePosition: Vector2,
        width: number, height: number): number
    {
        const center = this.worldToScreenPoint(position, camera, width, height);
        const angle = Math.atan2(mousePosition.y - center.y, mousePosition.x - center.x);
        return angle;
    }

    private getRotation(angle: number, direction: Vector3, axis: Vector3): number {
        const deltaAngle = angle - this.lastAngle;
        const sign = direction.dot(axis) >= 0 ? 1 : -1;
        return deltaAngle * sign;
    }

    private endDrag = () => {
        this.selector.enabled = true;
        this.activeHandle = null;
        window.removeEventListener("mousemove", this.onDrag);
        window.removeEventListener("mouseup", this.endDrag);
    }
}