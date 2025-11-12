import { ArrowHelper, AxesHelper, Camera, Color, ConeGeometry, CylinderGeometry, DoubleSide, EdgesGeometry, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Raycaster, Vector2, Vector3, type ColorRepresentation, type Scene } from "three";
import type { IHandable } from "./interfaces/IHandable";
import { QuadMesh } from "three/webgpu";
import { MeshPostProcessingMaterial } from "three/examples/jsm/Addons.js";
import type { Selector } from "./selector";
import type { ISelectable } from "./interfaces/ISelectable";

export class Handler {
    private scene: Scene;
    private selector: Selector;
    private readonly raycaster: Raycaster;

    private handler: Object3D;
    private rotate: Object3D;
    private scale: Object3D;

    private red: Color = new Color("red");
    private green: Color = new Color("green");
    private blue: Color = new Color("blue");

    
    // #region translation components
    private translate: Object3D;

    private rightComponent!: Mesh;
    private rightArrowHead!: Mesh;
    private rightArrowBody!: Mesh;
    private rightSquare!: Mesh;

    private upComponent!: Mesh;
    private upArrowHead!: Mesh;
    private upArrowBody!: Mesh;
    private upSquare!: Mesh;

    private forwardComponent!: Mesh;
    private forwardArrowHead!: Mesh;
    private forwardArrowBody!: Mesh;
    private forwardSquare!: Mesh;
    // #endregion

    private scaleFactor: number = 1;

    public constructor(scene: Scene, selector: Selector) {
        this.scene = scene;
        this.selector = selector;

        this.handler = new Object3D();
        this.translate = new Object3D();
        this.rotate = new Object3D();
        this.scale = new Object3D();

        const origin = new Vector3();
        const right = new Vector3(1, 0, 0);
        const up = new Vector3(0, 1, 0);
        const forward = new Vector3(0, 0, 1);

        this.raycaster = new Raycaster();
        
        this.createTranslationHandler();
        this.createRotationHandler(origin, right, up, forward);
        this.createScalingHandler(origin, right, up, forward);

        this.handler.add(this.translate, this.rotate, this.scale);
        this.scene.add(this.handler);

        window.addEventListener("click", (event) => this.trySelect(event));
        window.addEventListener("wheel", (event) => this.resize());
        window.addEventListener("mousemove", (event) => this.resize());
        this.resize();
    }

    public handle(handable: ISelectable): void {
        const mesh = handable as unknown as Mesh;
        this.handler.position.set(...mesh.position.clone().toArray());
    }

    private createTranslationHandler(): void {
        const bodyLength: number = 1;
        const bodyRadius: number = 0.005;
        const headLength: number = 0.1;
        const headRadius: number = 0.025;
        const squareSize: number = 0.25;
        
        const rightHandler = this.createDirectionHandler(this.red, bodyLength, bodyRadius, headLength, headRadius, squareSize);
        const upHandler = this.createDirectionHandler(this.green, bodyLength, bodyRadius, headLength, headRadius, squareSize);
        const forwardHandler = this.createDirectionHandler(this.blue, bodyLength, bodyRadius, headLength, headRadius, squareSize);

        rightHandler.rotateZ(-Math.PI / 2);
        rightHandler.translateY(squareSize / 2);
        forwardHandler.rotateX(Math.PI / 2);
        forwardHandler.translateY(squareSize / 2);
        upHandler.translateY(squareSize / 2);

        // this.translate.add(rightHandler);
        this.translate.add(rightHandler, upHandler, forwardHandler);
    }

    private createDirectionHandler(
        color: ColorRepresentation,
        bodyLength: number,
        bodyRadius: number,
        headLength: number,
        headRadius: number,
        squareSize: number,
    ): Object3D {
        const group = new Object3D();

        const material = new MeshBasicMaterial({
            color,
            side: DoubleSide,
            depthTest: false,
            depthWrite: false
        });

        const planeMaterial = new MeshBasicMaterial({
            color,
            side: DoubleSide,
            opacity: 0.1,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });

        const body = new Mesh(new CylinderGeometry(bodyRadius, bodyRadius, bodyLength), material);
        body.position.y = bodyLength / 2;

        const head = new Mesh(new ConeGeometry(headRadius, headLength), material);
        head.position.y = bodyLength;

        const plane = new PlaneGeometry(squareSize, squareSize);
        plane.lookAt(new Vector3(0, 1, 0));

        const edges = new EdgesGeometry(plane);
        const outline = new LineSegments(edges, new LineBasicMaterial({ color, depthTest: false, depthWrite: false }));

        const square0 = new Mesh(plane, planeMaterial);
        square0.add(outline);
        
        group.add(body, head, square0);

        return group;
    }


    private createRotationHandler(origin: Vector3, right: Vector3, up: Vector3, forward: Vector3,): void {
    }

    private createScalingHandler(origin: Vector3, right: Vector3, up: Vector3, forward: Vector3,): void {

    }

    private resize(): void {
        const camera = this.scene.getObjectByName("MainCamera");
        const position = camera?.position.clone() || new Vector3(1, 1, 1);
        position.set(Math.abs(position.x), Math.abs(position.y), Math.abs(position.z));
        const distance = position.distanceTo(new Vector3()) / 4;
        this.handler.scale.set(distance, distance, distance);
    }

    private trySelect(event: PointerEvent) {
        const objects = [this.translate];

        const normalized = this.normalizeCoordinates(event);
        const coordinates = new Vector2(normalized.x, normalized.y);

        const camera = this.scene.getObjectByName("MainCamera") as Camera;
        this.raycaster.setFromCamera(coordinates, camera)

        const intersections = this.raycaster.intersectObjects(objects);
        if(intersections.length === 0) return;
        
        const object = intersections[0].object;
        console.log(intersections[0])
    }

    private normalizeCoordinates(event: PointerEvent): {x: number, y: number} {
        const rect = {left: window.screenLeft, top: window.screenTop, width: window.innerWidth, height: window.innerHeight};
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        return { x, y };
    }
}